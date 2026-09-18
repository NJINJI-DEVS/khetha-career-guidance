using CareerAdvisor.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Services;

/// <summary>
/// Real server-side admin authorization. The frontend's `role` is pure UI
/// navigation state with zero enforcement (see useAppNavigation.js) — this is
/// the actual gate for admin-only actions (approving/rejecting mentor
/// applications), backed exclusively by active entries in the admins table.
///
/// Provision administrators with the operator-only --provision-admin command.
/// See backend/ADMIN-SETUP.md; public role claims cannot grant this permission.
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

        var isAdmin = await _db.Admins.AnyAsync(a => a.UserId == userId && a.IsActive);
        if (isAdmin)
            context.Succeed(requirement);
    }
}
