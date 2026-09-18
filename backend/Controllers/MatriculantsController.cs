using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Validates the Supabase-issued JWT (see Program.cs auth setup)
public class MatriculantsController : ControllerBase
{
    private readonly AppDbContext _db;
    public MatriculantsController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    [HttpGet("me")]
    public async Task<ActionResult<Matriculant>> GetMine(CancellationToken ct)
    {
        var profile = await _db.Matriculants
            .Include(m => m.Subjects)
            .FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);

        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPost]
    public async Task<ActionResult<Matriculant>> Create([FromBody] Matriculant input, CancellationToken ct)
    {
        var currentUserId = CurrentUserId;
        var exists = await _db.Matriculants.AnyAsync(m => m.UserId == currentUserId, ct);
        if (exists)
            return Conflict(new { error = "A profile already exists for this user. Use PUT to update it." });

        input.Id = Guid.NewGuid();
        input.UserId = currentUserId;
        input.CreatedAt = DateTime.UtcNow;
        foreach (var s in input.Subjects) { s.Id = Guid.NewGuid(); s.MatriculantId = input.Id; }

        _db.Matriculants.Add(input);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetMine), new { }, input);
    }

    [HttpPut("me/subjects")]
    public async Task<ActionResult> UpdateSubjects([FromBody] List<MatriculantSubject> subjects, CancellationToken ct)
    {
        var profile = await _db.Matriculants
            .Include(m => m.Subjects)
            .FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);

        if (profile is null) return NotFound();

        _db.MatriculantSubjects.RemoveRange(profile.Subjects);
        foreach (var s in subjects)
        {
            s.Id = Guid.NewGuid();
            s.MatriculantId = profile.Id;
            _db.MatriculantSubjects.Add(s);
        }

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Persists the learner's in-app journey state (favourites, saved
    /// questionnaire results, etc.) — see Matriculant.ProfileData's doc comment.
    /// Body is opaque JSON text; this endpoint never inspects it.</summary>
    [HttpPut("me/profile-data")]
    public async Task<ActionResult> UpdateProfileData([FromBody] ProfileDataDto body, CancellationToken ct)
    {
        var profile = await _db.Matriculants.FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);
        if (profile is null) return NotFound();

        profile.ProfileData = body.Data;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Backs the real "Delete Results" button in Settings — it used to
    /// only clear React state client-side, leaving the server copy untouched
    /// and due to be silently re-saved on the next debounced write. This
    /// actually clears it server-side.</summary>
    [HttpDelete("me/profile-data")]
    public async Task<ActionResult> DeleteProfileData(CancellationToken ct)
    {
        var profile = await _db.Matriculants.FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);
        if (profile is null) return NotFound();

        profile.ProfileData = null;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record ProfileDataDto(string? Data);
