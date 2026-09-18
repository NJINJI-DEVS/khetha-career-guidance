using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

public record AccountRoleDto(string Role);

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
}
