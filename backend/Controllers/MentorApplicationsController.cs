using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MentorApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IRiskFlagsService _riskFlags;
    public MentorApplicationsController(AppDbContext db, IRiskFlagsService riskFlags)
    {
        _db = db;
        _riskFlags = riskFlags;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    /// <summary>Submit a mentor/professional application. Risk score is computed
    /// server-side and stored — never accepted from the client.</summary>
    [HttpPost]
    public async Task<ActionResult<MentorApplication>> Submit([FromBody] MentorApplication input, CancellationToken ct)
    {
        input.Id = Guid.NewGuid();
        input.UserId = CurrentUserId;
        input.Status = "pending";
        input.SubmittedAt = DateTime.UtcNow;
        input.DecidedAt = null;
        input.DecidedByUserId = null;

        var (flags, score, verdict) = _riskFlags.Evaluate(input);
        input.RiskFlags = flags;
        input.RiskScore = score;
        input.RiskVerdict = verdict;

        _db.MentorApplications.Add(input);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetMine), new { }, input);
    }

    [HttpGet("me")]
    public async Task<ActionResult<List<MentorApplication>>> GetMine(CancellationToken ct)
    {
        var mine = await _db.MentorApplications
            .Where(a => a.UserId == CurrentUserId)
            .OrderByDescending(a => a.SubmittedAt)
            .ToListAsync(ct);
        return Ok(mine);
    }

    [HttpGet("pending")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<List<MentorApplication>>> GetPending(CancellationToken ct)
    {
        var pending = await _db.MentorApplications
            .Where(a => a.Status == "pending")
            .OrderBy(a => a.SubmittedAt)
            .ToListAsync(ct);
        return Ok(pending);
    }

    [HttpPost("{id}/approve")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Mentor>> Approve(Guid id, CancellationToken ct)
    {
        var app = await _db.MentorApplications.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (app is null) return NotFound();
        if (app.Status != "pending") return Conflict(new { error = "Application has already been decided." });

        app.Status = "approved";
        app.DecidedAt = DateTime.UtcNow;
        app.DecidedByUserId = CurrentUserId;

        var mentor = new Mentor
        {
            Id = Guid.NewGuid(),
            UserId = app.UserId,
            FullName = app.FullName,
            Role = app.Role,
            Field = app.Field,
            Subjects = app.Subjects,
            InstitutionOrEmployer = app.Institution,
            WorkEmail = app.WorkEmail,
            VerificationTiers = BuildVerificationTiers(app),
            SourceApplicationId = app.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };
        _db.Mentors.Add(mentor);

        _db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = CurrentUserId,
            Action = "application.approved",
            EntityType = "mentor_application",
            EntityId = app.Id,
            Details = $"riskVerdict={app.RiskVerdict};riskScore={app.RiskScore}",
        });
        _db.Notifications.Add(new Notification
        {
            UserId = app.UserId,
            Title = "Your mentor application was approved",
            Body = "You're now a verified mentor on Khetha. Learners can start sending you help requests.",
            Target = "workspace",
        });

        await _db.SaveChangesAsync(ct);
        return Ok(mentor);
    }

    [HttpPost("{id}/reject")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Reject(Guid id, CancellationToken ct)
    {
        var app = await _db.MentorApplications.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (app is null) return NotFound();
        if (app.Status != "pending") return Conflict(new { error = "Application has already been decided." });

        app.Status = "rejected";
        app.DecidedAt = DateTime.UtcNow;
        app.DecidedByUserId = CurrentUserId;

        _db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = CurrentUserId,
            Action = "application.rejected",
            EntityType = "mentor_application",
            EntityId = app.Id,
            Details = $"riskVerdict={app.RiskVerdict};riskScore={app.RiskScore}",
        });
        _db.Notifications.Add(new Notification
        {
            UserId = app.UserId,
            Title = "Your mentor application was not approved",
            Body = "Thanks for applying to Khetha. This application wasn't approved this time.",
            Target = null,
        });

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static string[] BuildVerificationTiers(MentorApplication app)
    {
        var tiers = new List<string>();
        if (!string.IsNullOrEmpty(app.IdDocumentFilename)) tiers.Add("ID Verified");
        if (!string.IsNullOrEmpty(app.TranscriptFilename) || !string.IsNullOrEmpty(app.LicenceNumber)) tiers.Add("Degree Verified");
        if (!string.IsNullOrEmpty(app.PartnerName)) tiers.Add("NGO Vetted");
        return tiers.ToArray();
    }
}
