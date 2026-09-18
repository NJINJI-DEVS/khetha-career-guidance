using CareerAdvisor.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Services;

/// <summary>
/// Real server-side admin authorization. The frontend's `role` is pure UI
/// navigation state with zero enforcement (see useAppNavigation.js) — this is
/// the actual gate for admin-only actions (approving/rejecting mentor
/// applications), backed by the user_roles table.
///
/// Bootstrapping the first admin: once you have a real Supabase Auth account you
/// want as admin, run this once in the Supabase SQL editor:
///   INSERT INTO user_roles (user_id, role) VALUES ('&lt;their-auth-user-id&gt;', 'admin');
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

        var isAdmin = await _db.UserRoles.AnyAsync(r => r.UserId == userId && r.Role == "admin");
        if (isAdmin)
            context.Succeed(requirement);
    }
}
