using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

public record AccountRoleDto(string Role);

/// <summary>What the person ticked, plus guardian details where they apply.</summary>
public record ConsentDto(
    bool Core, bool Notify, bool Research,
    bool IsMinor, DateOnly? DateOfBirth,
    string? GuardianName, string? GuardianRelation, string? GuardianContact,
    int Version, DateTime AcceptedAt);

public record SaveConsentDto(
    bool Core, bool Notify, bool Research,
    bool IsMinor, DateOnly? DateOfBirth,
    string? GuardianName, string? GuardianRelation, string? GuardianContact);

/// <summary>
/// Binds a Supabase account to a single role, permanently, the first time it's
/// ever seen — so the same login can't sign in as a student one time and a
/// mentor the next. The frontend's role picker (RoleSelector) only chooses
/// which role a BRAND NEW account registers as; every login after that, this
/// is the real source of truth (see AuthContext / App.jsx's post-auth check).
/// "admin" can't be claimed here — it's only ever set by the manual bootstrap
/// SQL described in AdminAuthorizationHandler's doc comment.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController : ControllerBase
{
    private static readonly string[] SelfClaimableRoles = { "student", "mentor", "professional" };

    private readonly AppDbContext _db;
    public AccountController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    [HttpGet("role")]
    public async Task<ActionResult<AccountRoleDto>> GetRole(CancellationToken ct)
    {
        var row = await _db.UserRoles.FirstOrDefaultAsync(r => r.UserId == CurrentUserId, ct);
        if (row is null) return NotFound();
        return Ok(new AccountRoleDto(row.Role));
    }

    /// <summary>Claims a role for this account. Only succeeds once — a second
    /// call (from a different device, or a retried request) returns the role
    /// already on file rather than letting the account's role change.</summary>
    [HttpPost("role")]
    public async Task<ActionResult<AccountRoleDto>> ClaimRole([FromBody] AccountRoleDto body, CancellationToken ct)
    {
        if (!SelfClaimableRoles.Contains(body.Role))
            return BadRequest(new { error = $"'{body.Role}' can't be self-registered." });

        var existing = await _db.UserRoles.FirstOrDefaultAsync(r => r.UserId == CurrentUserId, ct);
        if (existing is not null)
            return Conflict(new AccountRoleDto(existing.Role));

        _db.UserRoles.Add(new UserRole { UserId = CurrentUserId, Role = body.Role });
        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // Lost a race with a concurrent claim from the same account — the
            // other request's row is what sticks; report that one instead.
            var winner = await _db.UserRoles.FirstAsync(r => r.UserId == CurrentUserId, ct);
            return Conflict(new AccountRoleDto(winner.Role));
        }
        return Ok(new AccountRoleDto(body.Role));
    }

    /// <summary>
    /// The consent already on file for this account, or 404 if there is none.
    ///
    /// A record at an older version returns 404 as well: the person consented to
    /// wording that no longer exists, so as far as the current terms are
    /// concerned they have not consented, and they are asked again.
    /// </summary>
    [HttpGet("consent")]
    public async Task<ActionResult<ConsentDto>> GetConsent(CancellationToken ct)
    {
        var c = await _db.UserConsents.FirstOrDefaultAsync(x => x.UserId == CurrentUserId, ct);
        if (c is null || c.Version < UserConsent.CurrentVersion) return NotFound();

        return Ok(new ConsentDto(
            c.Core, c.Notify, c.Research,
            c.IsMinor, c.DateOfBirth, c.GuardianName, c.GuardianRelation, c.GuardianContact,
            c.Version, c.AcceptedAt));
    }

    /// <summary>
    /// Records consent. Also used to change the optional choices later, which is
    /// why it upserts rather than refusing a second call.
    /// </summary>
    [HttpPost("consent")]
    public async Task<ActionResult<ConsentDto>> SaveConsent([FromBody] SaveConsentDto body, CancellationToken ct)
    {
        // Core is what the storage of a career profile rests on. Accepting a
        // record without it would leave the service holding data it has no
        // stated basis to hold.
        if (!body.Core)
            return BadRequest(new { error = "The app cannot store a career profile without the first consent." });

        // A minor's record is only lawful with a named, contactable guardian.
        if (body.IsMinor && (string.IsNullOrWhiteSpace(body.GuardianName)
                             || string.IsNullOrWhiteSpace(body.GuardianContact)))
            return BadRequest(new { error = "A learner under 18 needs a guardian's name and contact number." });

        var c = await _db.UserConsents.FirstOrDefaultAsync(x => x.UserId == CurrentUserId, ct);
        var isNew = c is null;
        c ??= new UserConsent { UserId = CurrentUserId };

        c.Core = body.Core;
        c.Notify = body.Notify;
        c.Research = body.Research;
        c.IsMinor = body.IsMinor;
        c.DateOfBirth = body.DateOfBirth;
        c.GuardianName = body.GuardianName?.Trim();
        c.GuardianRelation = body.GuardianRelation?.Trim();
        c.GuardianContact = body.GuardianContact?.Trim();
        c.Version = UserConsent.CurrentVersion;
        if (isNew) { c.AcceptedAt = DateTime.UtcNow; _db.UserConsents.Add(c); }
        else c.UpdatedAt = DateTime.UtcNow;

        // Consent is the kind of thing that has to be provable after the fact.
        _db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = CurrentUserId,
            Action = isNew ? "consent.given" : "consent.updated",
            EntityType = "user_consent",
            EntityId = CurrentUserId,
            Details = $"v{c.Version};notify={c.Notify};research={c.Research};minor={c.IsMinor}",
        });

        await _db.SaveChangesAsync(ct);
        return Ok(new ConsentDto(
            c.Core, c.Notify, c.Research,
            c.IsMinor, c.DateOfBirth, c.GuardianName, c.GuardianRelation, c.GuardianContact,
            c.Version, c.AcceptedAt));
    }
}
