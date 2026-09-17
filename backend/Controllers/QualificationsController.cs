using CareerAdvisor.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QualificationsController : ControllerBase
{
    private readonly AppDbContext _db;
    public QualificationsController(AppDbContext db) => _db = db;

    /// <summary>Search locally-synced SAQA qualification records (see SaqaImportService).</summary>
    [HttpGet("saqa")]
    public async Task<ActionResult> SearchSaqa([FromQuery] string? q, CancellationToken ct)
    {
        var query = _db.SaqaQualifications.AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(s => EF.Functions.ILike(s.Title, $"%{q}%"));

        return Ok(await query.Take(50).ToListAsync(ct));
    }

    /// <summary>Search locally-synced OFO occupation codes (see OfoImportService).</summary>
    [HttpGet("ofo")]
    public async Task<ActionResult> SearchOfo([FromQuery] string? q, CancellationToken ct)
    {
        var query = _db.OfoCodes.AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(o => EF.Functions.ILike(o.Title, $"%{q}%"));

        return Ok(await query.Take(50).ToListAsync(ct));
    }
}
