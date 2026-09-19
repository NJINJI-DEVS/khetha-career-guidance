using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MentorApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IRiskFlagsService _riskFlags;
    private readonly ApplicationDocuments _documents;
    public MentorApplicationsController(AppDbContext db, IRiskFlagsService riskFlags, ApplicationDocuments documents)
    {
        _db = db;
        _riskFlags = riskFlags;
        _documents = documents;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    /// <summary>Submit a mentor/professional application. Risk score is computed
    /// server-side and stored — never accepted from the client.</summary>
    [HttpPost]
    [RequestSizeLimit(11 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 11 * 1024 * 1024)]
    public async Task<ActionResult<MentorApplication>> Submit([FromForm] string application, IFormFile idDocument, IFormFile? transcript, CancellationToken ct)
    {
        MentorApplication? input;
        try { input = JsonSerializer.Deserialize<MentorApplication>(application, new JsonSerializerOptions(JsonSerializerDefaults.Web)); }
        catch (JsonException) { return BadRequest(new { error = "Invalid application." }); }
        if (input is null) return BadRequest(new { error = "Application is required." });
        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        // Lock the account to serialize concurrent submissions for the same user.
        var account = await _db.UserRoles.FromSqlInterpolated($"SELECT * FROM user_roles WHERE user_id = {CurrentUserId} FOR UPDATE").SingleOrDefaultAsync(ct);
        if (account is null || (account.Role != "mentor" && account.Role != "professional")) return Forbid();
        if (await _db.MentorApplications.AnyAsync(a => a.UserId == CurrentUserId && (a.Status == "pending" || a.Status == "approved"), ct))
            return Conflict(new { error = "You already have a pending or approved application." });
        if (string.IsNullOrWhiteSpace(input.FullName) || input.FullName.Length > 200 ||
            string.IsNullOrWhiteSpace(input.IdNumber) || !Regex.IsMatch(input.IdNumber, @"^(\d{13}|[A-Za-z0-9]{6,12})$") ||
            string.IsNullOrWhiteSpace(input.Institution) || input.Institution.Length > 200 ||
            !new[] { "stem", "business", "health", "trades", "social", "creative" }.Contains(input.Field) ||
            input.Subjects is null || input.Subjects.Length == 0 || input.Subjects.Length > 30 || input.Subjects.Any(s => string.IsNullOrWhiteSpace(s) || s.Length > 100) ||
            string.IsNullOrWhiteSpace(input.Claim) || input.Claim.Length > 3000 ||
            (string.IsNullOrWhiteSpace(input.WorkEmail) && transcript is null))
            return BadRequest(new { error = "Provide your name, ID/passport, institution, field, subjects, experience and work email or transcript." });
        byte[] identityBytes;
        byte[]? transcriptBytes;
        try {
            identityBytes = await ApplicationDocuments.ReadValidated(idDocument, ct);
            transcriptBytes = transcript is null ? null : await ApplicationDocuments.ReadValidated(transcript, ct);
        } catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
        input.Role = account.Role;
        input.IdDocumentFilename = Path.GetFileName(idDocument.FileName);
        input.TranscriptFilename = transcript is null ? null : Path.GetFileName(transcript.FileName);
        input.PartnerName = null; // A submitted code is not evidence of NGO vetting.
        input.DuplicateOf = null;
        input.SubjectMismatch = null;
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
        try {
            await _documents.Save(input.Id, identityBytes, transcriptBytes, ct);
            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        } catch {
            _documents.RemoveUncommitted(input.Id);
            throw;
        }
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

    /// <summary>
    /// Every application an administrator might look at, decided or not.
    ///
    /// The queue screen has Pending / Approved / Rejected tabs, and until this
    /// existed it was fed from `pending` alone — so approving something made it
    /// vanish rather than move, and the other two tabs were permanently empty.
    /// Capped, newest decisions first, because the useful history is recent.
    /// </summary>
    [HttpGet("all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<List<MentorApplication>>> GetAll(
        [FromQuery] string? status, CancellationToken ct)
    {
        var q = _db.MentorApplications.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) q = q.Where(a => a.Status == status);

        return Ok(await q
            // Pending first regardless of date: it is the only tab with work in it.
            .OrderBy(a => a.Status == "pending" ? 0 : 1)
            .ThenByDescending(a => a.DecidedAt ?? a.SubmittedAt)
            .Take(300)
            .ToListAsync(ct));
    }

    [HttpGet("{id}/documents/{kind}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DownloadDocument(Guid id, string kind, CancellationToken ct)
    {
        if (kind != "identity" && kind != "transcript") return NotFound();
        var application = await _db.MentorApplications.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id, ct);
        if (application is null) return NotFound();
        var filename = kind == "identity" ? application.IdDocumentFilename : application.TranscriptFilename;
        var path = _documents.DocumentPath(id, kind);
        if (filename is null || !System.IO.File.Exists(path)) return NotFound(new { error = "No document is stored for this application." });
        Response.Headers.CacheControl = "no-store";
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        return PhysicalFile(path, "application/octet-stream", filename);
    }

    [HttpPost("{id}/approve")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Mentor>> Approve(Guid id, CancellationToken ct)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        var app = await _db.MentorApplications.FromSqlInterpolated($"SELECT * FROM mentor_applications WHERE id = {id} FOR UPDATE").SingleOrDefaultAsync(ct);
        if (app is null) return NotFound();
        if (app.Status != "pending") return Conflict(new { error = "Application has already been decided." });
        if (!_documents.HasIdentity(app.Id)) return BadRequest(new { error = "The identity document is missing. Reject this application and ask the applicant to resubmit with a document." });
        if (await _db.Mentors.AnyAsync(m => m.UserId == app.UserId, ct)) return Conflict(new { error = "This account already has a mentor profile." });
        if (!await _db.UserRoles.AnyAsync(r => r.UserId == app.UserId && r.Role == app.Role && (r.Role == "mentor" || r.Role == "professional"), ct))
            return BadRequest(new { error = "The applicant no longer has a mentor or professional account." });

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
            Bio = app.Claim,
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
        await transaction.CommitAsync(ct);
        return Ok(mentor);
    }

    [HttpPost("{id}/reject")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Reject(Guid id, CancellationToken ct)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        var app = await _db.MentorApplications.FromSqlInterpolated($"SELECT * FROM mentor_applications WHERE id = {id} FOR UPDATE").SingleOrDefaultAsync(ct);
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
        await transaction.CommitAsync(ct);
        return NoContent();
    }

    /// <summary>
    /// Which verification tiers an approved applicant has earned.
    ///
    /// Returns STABLE KEYS ("id", "degree", "ngo"), not display labels. The
    /// frontend looks these up in its TIERS map to pick a label, colour and
    /// icon, so emitting "ID Verified" here produced an undefined lookup and
    /// crashed the whole mentor directory. A label is a presentation concern
    /// and belongs on the client, where it can also be translated.
    /// </summary>
    private static string[] BuildVerificationTiers(MentorApplication app)
    {
        var tiers = new List<string>();
        if (!string.IsNullOrEmpty(app.IdDocumentFilename)) tiers.Add("id");
        if (!string.IsNullOrEmpty(app.TranscriptFilename) || !string.IsNullOrEmpty(app.LicenceNumber)) tiers.Add("degree");
        if (!string.IsNullOrEmpty(app.PartnerName)) tiers.Add("ngo");
        return tiers.ToArray();
    }
}
