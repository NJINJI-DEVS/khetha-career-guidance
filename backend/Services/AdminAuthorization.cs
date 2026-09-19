using CareerAdvisor.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Services;

/// <summary>
/// Real server-side admin authorization. The frontend's `role` is pure UI
/// navigation state with zero enforcement (see useAppNavigation.js) — this is
/// the actual gate for every admin-only action.
///
/// Backed by the `admins` table, not `user_roles`. The two were doing one
/// another's jobs: user_roles decides which navigation an account sees, admins
/// decides what it may actually do, and only the second needs an audit trail.
/// A row in user_roles saying "admin" grants nothing on its own.
///
/// Bootstrapping the first administrator is handled by AdminController, keyed on
/// the Admin:BootstrapEmail configuration value, and only works while the table
/// holds no active administrator.
/// </summary>
public class AdminRequirement : IAuthorizationRequirement { }

public class AdminAuthorizationHandler : AuthorizationHandler<AdminRequirement>
{
    private readonly AppDbContext _db;
    public AdminAuthorizationHandler(AppDbContext db) => _db = db;

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, AdminRequirement requirement)
    {
        var subClaim = context.User.FindFirst("sub")?.Value;
        if (subClaim is null || !Guid.TryParse(subClaim, out var userId))
            return;

        var admin = await _db.Admins
            .FirstOrDefaultAsync(a => a.UserId == userId && a.IsActive);
        if (admin is null) return;

        context.Succeed(requirement);

        // Last-seen is best-effort telemetry for spotting dormant admin
        // accounts. It must never turn a successful authorization into a
        // failure, and it is throttled to a day so an admin clicking through
        // ten screens does not write ten times.
        try
        {
            if (admin.LastSeenAt is null || (DateTime.UtcNow - admin.LastSeenAt.Value).TotalHours >= 24)
            {
                admin.LastSeenAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
        catch
        {
            // Ignored on purpose: see above.
        }
    }
}
