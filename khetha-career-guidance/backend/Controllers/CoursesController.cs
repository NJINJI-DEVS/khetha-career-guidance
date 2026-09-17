using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.DTOs;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseMatchingService _matcher;
    private readonly AppDbContext _db;

    public CoursesController(ICourseMatchingService matcher, AppDbContext db)
    {
        _matcher = matcher;
        _db = db;
    }

    /// <summary>Given subject percentages, return every course with qualify/unmet-requirement status.</summary>
    [HttpPost("match")]
    [ProducesResponseType(typeof(List<CourseMatchDto>), 200)]
    public async Task<ActionResult<List<CourseMatchDto>>> Match([FromBody] CourseMatchRequest request, CancellationToken ct)
    {
        if (request.Subjects is null || request.Subjects.Count == 0)
            return BadRequest(new { error = "At least one subject is required." });

        var results = await _matcher.FindMatchesAsync(request, ct);
        return Ok(results);
    }

    [HttpGet]
    public async Task<ActionResult> List([FromQuery] string? faculty, [FromQuery] string? province, CancellationToken ct)
    {
        var query = _db.Courses.Include(c => c.University).AsQueryable();
        if (!string.IsNullOrWhiteSpace(faculty)) query = query.Where(c => c.FacultyName == faculty);
        if (!string.IsNullOrWhiteSpace(province)) query = query.Where(c => c.University!.Province == province);

        var courses = await query
            .Select(c => new { c.Id, c.Name, c.FacultyName, c.MinimumAps, University = c.University!.Name })
            .ToListAsync(ct);

        return Ok(courses);
    }
}
