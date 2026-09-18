using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

public record IssueRecommendationLetterDto(Guid HelpRequestId, string Strength, string Body);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecommendationLettersController : ControllerBase
{
    private readonly AppDbContext _db;
    public RecommendationLettersController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    /// <summary>Only the mentor on an accepted help request may issue a letter for it.</summary>
    [HttpPost("issue")]
    public async Task<ActionResult<RecommendationLetter>> Issue([FromBody] IssueRecommendationLetterDto body, CancellationToken ct)
    {
        var req = await _db.HelpRequests.FirstOrDefaultAsync(h => h.Id == body.HelpRequestId, ct);
        if (req is null) return NotFound();

        var mentor = await _db.Mentors.FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);
        if (mentor is null || req.MentorId != mentor.Id) return Forbid();
        if (req.Status != "accepted")
            return Conflict(new { error = "Letters can only be issued for accepted help requests." });

        var letter = new RecommendationLetter
        {
            Id = Guid.NewGuid(),
            HelpRequestId = req.Id,
            IssuedByMentorId = mentor.Id,
            Strength = body.Strength,
            Body = body.Body,
            ReferenceNumber = $"KHE-{req.Id.ToString()[..8].ToUpperInvariant()}-{DateTime.UtcNow:yyyyMMddHHmmss}",
            IssuedAt = DateTime.UtcNow,
        };
        _db.RecommendationLetters.Add(letter);

        var matriculant = await _db.Matriculants.FirstAsync(m => m.Id == req.MatriculantId, ct);
        _db.Notifications.Add(new Notification
        {
            UserId = matriculant.UserId,
            Title = "A mentor issued you a recommendation letter",
            Body = $"{mentor.FullName} issued a letter for your {req.Subject} request. Reference {letter.ReferenceNumber}.",
            Target = "me",
        });

        await _db.SaveChangesAsync(ct);
        return Ok(letter);
    }

    [HttpGet("for-learner/mine")]
    public async Task<ActionResult<List<RecommendationLetter>>> ForLearnerMine(CancellationToken ct)
    {
        var matriculant = await _db.Matriculants.FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);
        if (matriculant is null) return Ok(new List<RecommendationLetter>());

        var letters = await _db.RecommendationLetters
            .Join(_db.HelpRequests, l => l.HelpRequestId, h => h.Id, (l, h) => new { l, h })
            .Where(x => x.h.MatriculantId == matriculant.Id)
            .Select(x => x.l)
            .OrderByDescending(l => l.IssuedAt)
            .ToListAsync(ct);
        return Ok(letters);
    }
}
