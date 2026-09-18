using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerAdvisor.Api.Controllers;

public record AskAdvisorDto(string Message, string Language);
public record AdvisorReplyDto(string Reply);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdvisorController : ControllerBase
{
    private readonly IAdvisorService _advisor;
    public AdvisorController(IAdvisorService advisor) => _advisor = advisor;

    /// <summary>Real AI fallback for the Advisor chat — only reached once the
    /// frontend's own instant keyword-matched scripts find no hit. Requires a
    /// real signed-in account (not guest mode), since each call costs real
    /// money against a third-party API.</summary>
    [HttpPost("ask")]
    public async Task<ActionResult<AdvisorReplyDto>> Ask([FromBody] AskAdvisorDto body, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Message))
            return BadRequest(new { error = "Message is required." });
        if (body.Message.Length > 1000)
            return BadRequest(new { error = "Message is too long." });

        try
        {
            var reply = await _advisor.AskAsync(body.Message, body.Language ?? "en", ct);
            return Ok(new AdvisorReplyDto(reply));
        }
        catch (InvalidOperationException ex)
        {
            // Missing/invalid API key or a bad upstream response — not the
            // caller's fault. The frontend falls back to a static message.
            return StatusCode(503, new { error = ex.Message });
        }
    }
}
