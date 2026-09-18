using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.DTOs;
using CareerAdvisor.Api.Models;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

public record RespondToHelpRequestDto(bool Accept);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HelpRequestsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IApsCalculatorService _apsCalculator;
    public HelpRequestsController(AppDbContext db, IApsCalculatorService apsCalculator)
    {
        _db = db;
        _apsCalculator = apsCalculator;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    /// <summary>The learner sends a structured request to an approved mentor.
    /// APS/marks are snapshotted server-side from the caller's own matriculant
    /// profile, not accepted from the client.</summary>
    [HttpPost]
    public async Task<ActionResult<HelpRequestDto>> Create([FromBody] HelpRequest input, CancellationToken ct)
    {
        var matriculant = await _db.Matriculants.Include(m => m.Subjects)
            .FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);
        if (matriculant is null)
            return BadRequest(new { error = "Create your learner profile before sending a help request." });

        var mentor = await _db.Mentors.FirstOrDefaultAsync(m => m.Id == input.MentorId && m.IsActive, ct);
        if (mentor is null) return NotFound(new { error = "Mentor not found." });

        var apsResult = _apsCalculator.Calculate(new ApsCalculationRequest(
            matriculant.Subjects.Select(s => new SubjectScoreDto(s.SubjectName, s.Percentage, s.IsHomeLanguage)).ToList()));
        var marksSummary = string.Join(", ", matriculant.Subjects.Take(3).Select(s => $"{s.SubjectName} {s.Percentage}%"));

        input.Id = Guid.NewGuid();
        input.MatriculantId = matriculant.Id;
        input.Status = "pending";
        input.SentAt = DateTime.UtcNow;
        input.RespondedAt = null;
        input.AttachedAps = apsResult.TotalAps;
        input.AttachedMarksSummary = marksSummary;

        _db.HelpRequests.Add(input);

        _db.Notifications.Add(new Notification
        {
            UserId = mentor.UserId,
            Title = "New help request",
            Body = $"{matriculant.FullName} asked for help with {input.Subject}.",
            Target = "workspace",
        });

        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetMine), new { }, ToDto(input, matriculant, mentor, hasLetter: false));
    }

    [HttpGet("mine")]
    public async Task<ActionResult<List<HelpRequestDto>>> GetMine(CancellationToken ct)
    {
        var matriculant = await _db.Matriculants.FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);
        var mentor = await _db.Mentors.FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);

        var mine = await _db.HelpRequests
            .Where(h => (matriculant != null && h.MatriculantId == matriculant.Id) ||
                        (mentor != null && h.MentorId == mentor.Id))
            .OrderByDescending(h => h.SentAt)
            .ToListAsync(ct);

        if (mine.Count == 0) return Ok(new List<HelpRequestDto>());

        var matriculantIds = mine.Select(h => h.MatriculantId).Distinct().ToList();
        var mentorIds = mine.Select(h => h.MentorId).Distinct().ToList();
        var requestIds = mine.Select(h => h.Id).ToList();

        var matriculants = await _db.Matriculants.Where(m => matriculantIds.Contains(m.Id)).ToListAsync(ct);
        var mentors = await _db.Mentors.Where(m => mentorIds.Contains(m.Id)).ToListAsync(ct);
        var requestsWithLetters = await _db.RecommendationLetters
            .Where(l => requestIds.Contains(l.HelpRequestId))
            .Select(l => l.HelpRequestId)
            .ToListAsync(ct);
        var letterSet = requestsWithLetters.ToHashSet();

        var matriculantById = matriculants.ToDictionary(m => m.Id);
        var mentorById = mentors.ToDictionary(m => m.Id);

        var dtos = mine.Select(h => ToDto(h, matriculantById.GetValueOrDefault(h.MatriculantId),
            mentorById.GetValueOrDefault(h.MentorId), letterSet.Contains(h.Id))).ToList();
        return Ok(dtos);
    }

    /// <summary>The mentor accepts or declines. Only the mentor on this request may respond.</summary>
    [HttpPost("{id}/respond")]
    public async Task<ActionResult<HelpRequestDto>> Respond(Guid id, [FromBody] RespondToHelpRequestDto body, CancellationToken ct)
    {
        var req = await _db.HelpRequests.FirstOrDefaultAsync(h => h.Id == id, ct);
        if (req is null) return NotFound();

        var mentor = await _db.Mentors.FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);
        if (mentor is null || req.MentorId != mentor.Id) return Forbid();
        if (req.Status != "pending") return Conflict(new { error = "This request has already been responded to." });

        req.Status = body.Accept ? "accepted" : "declined";
        req.RespondedAt = DateTime.UtcNow;

        var matriculant = await _db.Matriculants.FirstAsync(m => m.Id == req.MatriculantId, ct);
        _db.Notifications.Add(new Notification
        {
            UserId = matriculant.UserId,
            Title = body.Accept ? "Your help request was accepted" : "Your help request was declined",
            Body = body.Accept
                ? $"{mentor.FullName} accepted your request about {req.Subject}. You can start messaging them."
                : $"{mentor.FullName} wasn't able to take this on. Try another mentor.",
            Target = "mentors",
        });

        await _db.SaveChangesAsync(ct);
        return Ok(ToDto(req, matriculant, mentor, hasLetter: false));
    }

    private static HelpRequestDto ToDto(HelpRequest h, Matriculant? matriculant, Mentor? mentor, bool hasLetter) => new(
        h.Id, h.MatriculantId, h.MentorId, h.Subject, h.Goal, h.Need, h.Status, h.SentAt, h.RespondedAt,
        h.AttachedAps, h.AttachedMarksSummary,
        LearnerName: matriculant?.FullName ?? "Unknown learner",
        LearnerGrade: matriculant?.Grade,
        MentorName: mentor?.FullName ?? "Unknown mentor",
        HasLetter: hasLetter
    );
}
