using CareerAdvisor.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminAccountController(AppDbContext db) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst("sub")!.Value);
        var admin = await db.Admins.AsNoTracking().FirstOrDefaultAsync(a => a.UserId == userId && a.IsActive, ct);
        if (admin is null) return Forbid();
        return Ok(new { admin.UserId, admin.Email, Role = "admin" });
    }
}
