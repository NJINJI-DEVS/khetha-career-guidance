using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

public record AdminDto(
    Guid UserId, string Email, string? DisplayName, bool IsActive,
    DateTime GrantedAt, string GrantedVia, string? GrantedByEmail,
    DateTime? LastSeenAt, DateTime? RevokedAt, string? Note);

public record GrantAdminDto(string Email, string? Note);
public record RevokeAdminDto(string? Note);

/// <summary>
/// Administrator identity and administrator management.
///
/// `GET me` is deliberately [Authorize] rather than AdminOnly: it is the
/// endpoint an account calls to find out whether it is an administrator, and
/// gating it on being one would make that unanswerable.
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AdminController> _log;

    public AdminController(AppDbContext db, IConfiguration config, ILogger<AdminController> log)
    {
        _db = db;
        _config = config;
        _log = log;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    /// <summary>
    /// Supabase puts the address in the "email" claim. Falls back to
    /// user_metadata's copy, which is what some social providers populate.
    /// </summary>
    private string CurrentEmail =>
        User.FindFirst("email")?.Value
        ?? User.FindFirst("user_metadata.email")?.Value
        ?? string.Empty;

    private static AdminDto ToDto(Admin a) => new(
        a.UserId, a.Email, a.DisplayName, a.IsActive, a.GrantedAt, a.GrantedVia,
        a.GrantedByEmail, a.LastSeenAt, a.RevokedAt, a.Note);

    /// <summary>
    /// Whether the caller is an administrator, bootstrapping them if they are
    /// the configured first administrator and none exists yet.
    ///
    /// Returns 404 for an ordinary account — "you are not an administrator" is
    /// the answer, not an error.
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<AdminDto>> Me(CancellationToken ct)
    {
        var existing = await _db.Admins.FirstOrDefaultAsync(a => a.UserId == CurrentUserId, ct);
        if (existing is { IsActive: true }) return Ok(ToDto(existing));

        // A revoked administrator is not silently re-bootstrapped, even if their
        // address still matches the configured one. Revocation is a decision.
        if (existing is { IsActive: false }) return NotFound();

        var bootstrapped = await TryBootstrapAsync(ct);
        if (bootstrapped is not null) return Ok(ToDto(bootstrapped));

        return NotFound();
    }

    /// <summary>
    /// Grants administrator rights to the caller if, and only if:
    ///   - Admin:BootstrapEmail is configured,
    ///   - it matches the caller's verified email claim from the JWT, and
    ///   - no active administrator exists yet.
    ///
    /// The last condition is what makes this safe to leave enabled: once one
    /// administrator exists, this path is permanently closed and further grants
    /// go through an existing administrator. The email comes from the signed
    /// token, never from the request body, so it cannot be asserted by a caller.
    /// </summary>
    private async Task<Admin?> TryBootstrapAsync(CancellationToken ct)
    {
        var bootstrapEmail = _config["Admin:BootstrapEmail"];
        if (string.IsNullOrWhiteSpace(bootstrapEmail)) return null;

        var email = CurrentEmail;
        if (string.IsNullOrWhiteSpace(email)) return null;
        if (!string.Equals(email, bootstrapEmail.Trim(), StringComparison.OrdinalIgnoreCase)) return null;

        if (await _db.Admins.AnyAsync(a => a.IsActive, ct)) return null;

        var admin = new Admin
        {
            UserId = CurrentUserId,
            Email = email,
            DisplayName = User.FindFirst("name")?.Value,
            IsActive = true,
            GrantedAt = DateTime.UtcNow,
            GrantedVia = "bootstrap",
            Note = "First administrator, created from Admin:BootstrapEmail.",
        };
        _db.Admins.Add(admin);
        await EnsureAdminRoleAsync(CurrentUserId, ct);

        _db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = CurrentUserId,
            Action = "admin.bootstrap",
            EntityType = "admin",
            EntityId = CurrentUserId,
            Details = $"Bootstrap administrator created for {email}.",
        });

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // Two first sign-ins raced. Whoever committed first is the
            // administrator; re-read rather than reporting a failure.
            return await _db.Admins.FirstOrDefaultAsync(a => a.UserId == CurrentUserId && a.IsActive, ct);
        }

        _log.LogWarning("Bootstrap administrator created for {Email} ({UserId}).", email, CurrentUserId);
        return admin;
    }

    /// <summary>
    /// Keeps user_roles in step so the frontend's role reconciliation sends an
    /// administrator to the admin navigation. user_roles binds once and never
    /// changes, so an account that already registered as a learner keeps that
    /// row — admin rights come from the admins table regardless.
    /// </summary>
    private async Task EnsureAdminRoleAsync(Guid userId, CancellationToken ct)
    {
        var has = await _db.UserRoles.AnyAsync(r => r.UserId == userId, ct);
        if (!has) _db.UserRoles.Add(new UserRole { UserId = userId, Role = "admin" });
    }

    // ---- Administrator management -------------------------------------

    [HttpGet("admins")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<List<AdminDto>>> List(CancellationToken ct)
    {
        var rows = await _db.Admins
            .OrderByDescending(a => a.IsActive).ThenBy(a => a.Email)
            .ToListAsync(ct);
        return Ok(rows.Select(ToDto).ToList());
    }

    /// <summary>
    /// Grants administrator rights to an existing account, by email.
    ///
    /// The account must already have signed in at least once: this resolves the
    /// address against Supabase's auth.users, so there is no way to create an
    /// administrator for an address nobody has proven they control.
    /// </summary>
    [HttpPost("admins")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<AdminDto>> Grant([FromBody] GrantAdminDto body, CancellationToken ct)
    {
        var email = body.Email?.Trim();
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { error = "Give the email address of the account to promote." });

        var userId = await ResolveAuthUserIdAsync(email, ct);
        if (userId is null)
            return NotFound(new { error = $"No account has signed in with {email} yet. Ask them to sign in once first." });

        var existing = await _db.Admins.FirstOrDefaultAsync(a => a.UserId == userId, ct);
        if (existing is not null)
        {
            if (existing.IsActive) return Conflict(new { error = $"{email} is already an administrator." });
            // Reinstating a revoked administrator, keeping the original grant history.
            existing.IsActive = true;
            existing.RevokedAt = null;
            existing.RevokedByUserId = null;
            existing.GrantedAt = DateTime.UtcNow;
            existing.GrantedByUserId = CurrentUserId;
            existing.GrantedByEmail = CurrentEmail;
            existing.Note = body.Note;
        }
        else
        {
            _db.Admins.Add(new Admin
            {
                UserId = userId.Value,
                Email = email,
                IsActive = true,
                GrantedAt = DateTime.UtcNow,
                GrantedByUserId = CurrentUserId,
                GrantedByEmail = CurrentEmail,
                GrantedVia = "granted",
                Note = body.Note,
            });
        }

        await EnsureAdminRoleAsync(userId.Value, ct);
        _db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = CurrentUserId,
            Action = "admin.grant",
            EntityType = "admin",
            EntityId = userId.Value,
            Details = $"Granted administrator rights to {email}. {body.Note}".Trim(),
        });
        await _db.SaveChangesAsync(ct);

        var saved = await _db.Admins.FirstAsync(a => a.UserId == userId, ct);
        return Ok(ToDto(saved));
    }

    /// <summary>
    /// Revokes administrator rights. The row is kept and marked inactive so the
    /// record that this person once held rights survives.
    /// </summary>
    [HttpDelete("admins/{userId:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Revoke(Guid userId, [FromBody] RevokeAdminDto? body, CancellationToken ct)
    {
        // Locking yourself out is a support problem, not a security feature.
        if (userId == CurrentUserId)
            return BadRequest(new { error = "You cannot revoke your own administrator rights. Ask another administrator." });

        var target = await _db.Admins.FirstOrDefaultAsync(a => a.UserId == userId && a.IsActive, ct);
        if (target is null) return NotFound();

        // Nobody left to approve a mentor, and no way back in short of a
        // database edit — refuse rather than produce an orphaned platform.
        var activeCount = await _db.Admins.CountAsync(a => a.IsActive, ct);
        if (activeCount <= 1)
            return BadRequest(new { error = "This is the last administrator. Grant rights to someone else first." });

        target.IsActive = false;
        target.RevokedAt = DateTime.UtcNow;
        target.RevokedByUserId = CurrentUserId;
        target.Note = body?.Note ?? target.Note;

        _db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = CurrentUserId,
            Action = "admin.revoke",
            EntityType = "admin",
            EntityId = userId,
            Details = $"Revoked administrator rights from {target.Email}. {body?.Note}".Trim(),
        });
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>
    /// Looks up a Supabase auth user id by email.
    ///
    /// Raw SQL because auth.users belongs to Supabase's own schema and is not
    /// part of this application's EF model — mapping it would imply ownership of
    /// a table this service must never migrate. Parameterised, and it reads one
    /// column.
    /// </summary>
    private async Task<Guid?> ResolveAuthUserIdAsync(string email, CancellationToken ct)
    {
        var connection = _db.Database.GetDbConnection();
        await using var cmd = connection.CreateCommand();
        cmd.CommandText = "select id from auth.users where lower(email) = lower(@email) limit 1";
        var p = cmd.CreateParameter();
        p.ParameterName = "@email";
        p.Value = email;
        cmd.Parameters.Add(p);

        var opened = connection.State != System.Data.ConnectionState.Open;
        if (opened) await connection.OpenAsync(ct);
        try
        {
            var result = await cmd.ExecuteScalarAsync(ct);
            return result is Guid g ? g : null;
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Could not resolve auth user for {Email}.", email);
            return null;
        }
        finally
        {
            if (opened) await connection.CloseAsync();
        }
    }
}
