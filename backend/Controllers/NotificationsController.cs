using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;
    public NotificationsController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    [HttpGet("mine")]
    public async Task<ActionResult<List<Notification>>> GetMine(CancellationToken ct)
    {
        var mine = await _db.Notifications
            .Where(n => n.UserId == CurrentUserId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(ct);
        return Ok(mine);
    }

    [HttpPost("{id}/mark-read")]
    public async Task<ActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUserId, ct);
        if (n is null) return NotFound();
        n.IsRead = true;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("mark-all-read")]
    public async Task<ActionResult> MarkAllRead(CancellationToken ct)
    {
        await _db.Notifications
            .Where(n => n.UserId == CurrentUserId && !n.IsRead)
            .ExecuteUpdateAsync(setters => setters.SetProperty(n => n.IsRead, true), ct);
        return NoContent();
    }
}
