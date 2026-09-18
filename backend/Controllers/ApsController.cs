using CareerAdvisor.Api.DTOs;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApsController : ControllerBase
{
    private readonly IApsCalculatorService _apsCalculator;

    public ApsController(IApsCalculatorService apsCalculator) => _apsCalculator = apsCalculator;

    /// <summary>Calculate an APS score from a list of subject percentages.</summary>
    [HttpPost("calculate")]
    [ProducesResponseType(typeof(ApsCalculationResult), 200)]
    public ActionResult<ApsCalculationResult> Calculate([FromBody] ApsCalculationRequest request)
    {
        try
        {
            return Ok(_apsCalculator.Calculate(request));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
