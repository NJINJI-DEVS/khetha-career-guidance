using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Exposes real people's PII (name/bio/employer) — unlike universities/
            // courses, this is not treated as anonymous-readable reference data.
public class MentorsController : ControllerBase
{
    private readonly AppDbContext _db;
    public MentorsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<Mentor>>> List(
        [FromQuery] string? field, [FromQuery] string? province, [FromQuery] string? q, CancellationToken ct)
    {
        var query = _db.Mentors.Where(m => m.IsActive).AsQueryable();
        if (!string.IsNullOrWhiteSpace(field)) query = query.Where(m => m.Field == field);
        if (!string.IsNullOrWhiteSpace(province)) query = query.Where(m => m.Province == province);
        if (!string.IsNullOrWhiteSpace(q)) query = query.Where(m => EF.Functions.ILike(m.FullName, $"%{q}%"));

        var mentors = await query.OrderByDescending(m => m.Rating).ToListAsync(ct);
        return Ok(mentors);
    }
}
