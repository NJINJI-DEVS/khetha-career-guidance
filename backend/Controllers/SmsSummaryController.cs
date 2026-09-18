using CareerAdvisor.Api.DTOs;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SmsSummaryController : ControllerBase
{
    private readonly ISmsSummaryService _smsSummary;
    public SmsSummaryController(ISmsSummaryService smsSummary) => _smsSummary = smsSummary;

    /// <summary>Generates the SMS summary text server-side (does not send an SMS —
    /// no gateway is configured; the frontend displays/copies the text, as today).</summary>
    [HttpPost("generate")]
    public ActionResult<string> Generate([FromBody] SmsSummaryRequest request)
    {
        var text = _smsSummary.Build(request);
        return Ok(new { text });
    }
}
