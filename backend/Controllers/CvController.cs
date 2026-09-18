using System.Security.Cryptography;
using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

public record CvDto(string Payload, string Template, int Completeness, string? ShareToken, DateTime UpdatedAt);
public record CvSaveRequest(string Payload, string Template, int Completeness);
public record SharedCvDto(string Payload, string Template, DateTime UpdatedAt);

/// <summary>
/// The learner's CV. Everything except the public share view requires the
/// learner's own token — a CV is the most personal record this app holds, and
/// there is no legitimate reason for one learner to read another's.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CvController : ControllerBase
{
    private readonly AppDbContext _db;
    public CvController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    /// <summary>Returns the learner's CV, creating an empty one on first open so
    /// the wizard always has something to autosave into.</summary>
    [HttpGet("me")]
    public async Task<ActionResult<CvDto>> GetMine(CancellationToken ct)
    {
        var cv = await _db.CvDocuments.FirstOrDefaultAsync(c => c.UserId == CurrentUserId, ct);
        if (cv is null)
            return Ok(new CvDto("{}", "classic", 0, null, DateTime.UtcNow));

        return Ok(new CvDto(cv.Payload, cv.Template, cv.Completeness, cv.ShareToken, cv.UpdatedAt));
    }

    /// <summary>
    /// Upsert. The wizard autosaves on a debounce, so this is called often and
    /// deliberately does the least possible work.
    /// </summary>
    [HttpPut("me")]
    public async Task<ActionResult<CvDto>> Save([FromBody] CvSaveRequest body, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Payload))
            return BadRequest(new { error = "Payload is required." });

        // A runaway payload here would be a denial-of-service on a column read on
        // every dashboard load. A CV that exceeds this is not a CV.
        if (body.Payload.Length > 200_000)
            return BadRequest(new { error = "CV is too large." });

        var template = body.Template is "classic" or "modern" ? body.Template : "classic";

        var cv = await _db.CvDocuments.FirstOrDefaultAsync(c => c.UserId == CurrentUserId, ct);
        if (cv is null)
        {
            cv = new CvDocument { UserId = CurrentUserId };
            _db.CvDocuments.Add(cv);
        }

        cv.Payload = body.Payload;
        cv.Template = template;
        cv.Completeness = Math.Clamp(body.Completeness, 0, 100);
        cv.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(new CvDto(cv.Payload, cv.Template, cv.Completeness, cv.ShareToken, cv.UpdatedAt));
    }

    /// <summary>
    /// Publishes a shareable link. The token is 32 bytes of CSPRNG output in
    /// URL-safe base64 — a CV carries a learner's name and phone number, so the
    /// link has to be genuinely unguessable rather than merely obscure.
    /// Calling this again rotates the token, which invalidates any link already
    /// sent out.
    /// </summary>
    [HttpPost("me/share")]
    public async Task<ActionResult<CvDto>> Share(CancellationToken ct)
    {
        var cv = await _db.CvDocuments.FirstOrDefaultAsync(c => c.UserId == CurrentUserId, ct);
        if (cv is null) return NotFound(new { error = "Create your CV before sharing it." });

        cv.ShareToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');
        cv.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(new CvDto(cv.Payload, cv.Template, cv.Completeness, cv.ShareToken, cv.UpdatedAt));
    }

    /// <summary>Revokes the link. The CV itself is untouched.</summary>
    [HttpDelete("me/share")]
    public async Task<ActionResult> Unshare(CancellationToken ct)
    {
        var cv = await _db.CvDocuments.FirstOrDefaultAsync(c => c.UserId == CurrentUserId, ct);
        if (cv is null) return NotFound();

        cv.ShareToken = null;
        cv.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>
    /// The public view behind a share link. Anonymous by necessity — the point
    /// is that a bursary officer or employer can open it without an account.
    /// Returns only what renders: no user id, no completeness, no timestamps
    /// beyond the last update.
    /// </summary>
    [HttpGet("shared/{token}")]
    [AllowAnonymous]
    public async Task<ActionResult<SharedCvDto>> GetShared(string token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token) || token.Length < 20) return NotFound();

        var cv = await _db.CvDocuments.AsNoTracking()
            .FirstOrDefaultAsync(c => c.ShareToken == token, ct);
        if (cv is null) return NotFound();

        return Ok(new SharedCvDto(cv.Payload, cv.Template, cv.UpdatedAt));
    }
}
