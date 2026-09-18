using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.DTOs;
using CareerAdvisor.Api.Models;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

/// <summary>
/// The careers directory. Reads are anonymous — this is public reference data a
/// learner must be able to browse before deciding to create an account, and the
/// guest mode in the app depends on it.
///
/// Writes (import, enrich) are AdminOnly: they mutate the shared catalogue and
/// the enrichment endpoint spends money against a Gemini key.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class OccupationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IOfoFileImportService _fileImport;
    private readonly IOfoImportService _import;
    private readonly IOccupationEnrichmentService _enrichment;

    public OccupationsController(
        AppDbContext db, IOfoFileImportService fileImport,
        IOfoImportService import, IOccupationEnrichmentService enrichment)
    {
        _db = db; _fileImport = fileImport; _import = import; _enrichment = enrichment;
    }

    /// <summary>
    /// Browse the directory. Only published occupations are returned: an
    /// imported-but-unenriched row has no summary, subjects or RIASEC, so it
    /// would render as an empty card and break both matching engines.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<OccupationDto>>> List(
        [FromQuery] string? q,
        [FromQuery] string? field,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);   // an unbounded page size is a denial-of-service on a 1,500-row table

        var query = _db.OfoCodes.Where(o => o.IsPublished);

        if (!string.IsNullOrWhiteSpace(field))
            query = query.Where(o => o.FieldKey == field);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = $"%{q.Trim()}%";
            query = query.Where(o =>
                EF.Functions.ILike(o.Title, term) ||
                EF.Functions.ILike(o.Code, term) ||
                (o.Summary != null && EF.Functions.ILike(o.Summary, term)));
        }

        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderBy(o => o.Title)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = await WithQualificationsAsync(rows, ct);
        return Ok(new PagedResult<OccupationDto>(
            items, page, pageSize, total, (int)Math.Ceiling(total / (double)pageSize)));
    }

    [HttpGet("{code}")]
    public async Task<ActionResult<OccupationDto>> Get(string code, CancellationToken ct)
    {
        var row = await _db.OfoCodes.FirstOrDefaultAsync(o => o.Code == code && o.IsPublished, ct);
        if (row is null) return NotFound();
        var mapped = await WithQualificationsAsync(new List<OfoCode> { row }, ct);
        return Ok(mapped[0]);
    }

    /// <summary>Career field counts, so the directory can show chip totals without
    /// pulling every row.</summary>
    [HttpGet("fields")]
    public async Task<ActionResult<Dictionary<string, int>>> Fields(CancellationToken ct) =>
        Ok(await _db.OfoCodes
            .Where(o => o.IsPublished && o.FieldKey != null)
            .GroupBy(o => o.FieldKey!)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count, ct));

    /// <summary>
    /// Imports the published OFO file. There is no official REST API for this
    /// data — DHET distributes the OFO as a spreadsheet — so exporting that sheet
    /// to CSV and posting it here IS the official integration path.
    /// Imported rows land unpublished and become visible once enriched.
    /// </summary>
    [HttpPost("import")]
    [Authorize(Policy = "AdminOnly")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<ActionResult<OccupationImportResult>> Import(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0) return BadRequest(new { error = "No file uploaded." });

        OfoFileParseResult parsed;
        await using (var stream = file.OpenReadStream())
        {
            try { parsed = await _fileImport.ParseAsync(stream, ct); }
            catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
        }

        var imported = await _import.ImportFromRowsAsync(parsed.Rows, ct);
        return Ok(new OccupationImportResult(parsed.Rows.Count, imported, parsed.Warnings, parsed.DetectedHeaders));
    }

    /// <summary>
    /// Generates the learner-facing fields the OFO file does not carry. No-ops
    /// with a clear message when no Gemini key is configured.
    /// </summary>
    [HttpPost("enrich")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<EnrichmentResult>> Enrich([FromQuery] int batchSize = 25, CancellationToken ct = default)
        => Ok(await _enrichment.EnrichAsync(batchSize, ct));

    [HttpGet("status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<OccupationCatalogueStatus>> Status(CancellationToken ct)
    {
        var total = await _db.OfoCodes.CountAsync(ct);
        var published = await _db.OfoCodes.CountAsync(o => o.IsPublished, ct);
        var pending = await _db.OfoCodes.CountAsync(o => o.EnrichedAt == null, ct);

        var lastImport = await _db.DataSyncLogs.Where(l => l.SourceName == "OFO")
            .OrderByDescending(l => l.RunAt).Select(l => (DateTime?)l.RunAt).FirstOrDefaultAsync(ct);
        var lastEnrich = await _db.DataSyncLogs.Where(l => l.SourceName.StartsWith("Gemini"))
            .OrderByDescending(l => l.RunAt).Select(l => (DateTime?)l.RunAt).FirstOrDefaultAsync(ct);

        return Ok(new OccupationCatalogueStatus(
            total, published, pending, _enrichment.IsConfigured, lastImport, lastEnrich));
    }

    /// <summary>
    /// Courses link to occupations through Course.OfoCode, which is plain text
    /// with no foreign key — so this joins in memory on the page of rows already
    /// fetched rather than issuing a query per occupation.
    /// </summary>
    private async Task<List<OccupationDto>> WithQualificationsAsync(List<OfoCode> rows, CancellationToken ct)
    {
        var codes = rows.Select(r => r.Code).ToList();
        var courses = await _db.Courses
            .Include(c => c.University)
            .Where(c => c.OfoCode != null && codes.Contains(c.OfoCode))
            .ToListAsync(ct);

        var byCode = courses.GroupBy(c => c.OfoCode!).ToDictionary(g => g.Key, g => g.ToList());

        return rows.Select(o => new OccupationDto(
            Id: o.Code,
            Ofo: o.Code,
            Title: o.Title,
            Summary: o.Summary,
            Field: o.FieldKey,
            Riasec: o.Riasec,
            Subjects: o.Subjects,
            Tasks: o.Tasks,
            Demand: o.Demand,
            Salary: o.SalaryRange,
            SalaryMin: o.SalaryMin,
            SalaryMax: o.SalaryMax,
            Context: new OccupationContextDto(
                o.ContextPeople, o.ContextData, o.ContextThings, o.ContextOutdoors, o.ContextRoutine),
            MajorGroup: o.MajorGroup,
            SubMinorGroup: o.SubMinorGroup,
            Description: string.IsNullOrWhiteSpace(o.Description) ? null : o.Description,
            Link: o.Link,
            Provenance: new OccupationProvenanceDto(o.Source, o.EnrichmentModel, o.EnrichedAt, o.LastSyncedAt),
            Quals: byCode.TryGetValue(o.Code, out var cs)
                ? cs.Select(c => new OccupationQualificationDto(
                    c.Id, c.Name, c.University?.Name ?? "", c.FacultyName, c.MinimumAps)).ToList()
                : new List<OccupationQualificationDto>()
        )).ToList();
    }
}
