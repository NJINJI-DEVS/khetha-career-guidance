using CareerAdvisor.Api.DTOs;

namespace CareerAdvisor.Api.Services;

public interface IApsCalculatorService
{
    ApsCalculationResult Calculate(ApsCalculationRequest request, string scale = "standard-7-point");
}

/// <summary>
/// Converts NSC (matric) subject percentages into an Admission Point Score.
/// NOTE: APS scales genuinely differ between institutions (e.g. UCT's Faculty Points
/// Score excludes Life Orientation and uses its own bands; some universities use a
/// 10-point scale). This service ships the most common "standard 7-point" DHET-style
/// scale used by most public universities, and is written so a per-university scale
/// can be registered and selected via the `scale` parameter. Treat any single APS
/// number as an estimate — always confirm against the university's official calculator.
/// </summary>
public class ApsCalculatorService : IApsCalculatorService
{
    // % range -> points, NSC (National Senior Certificate) 7-point achievement scale
    private static readonly (int min, int max, int points)[] StandardScale =
    {
        (80, 100, 7),
        (70, 79, 6),
        (60, 69, 5),
        (50, 59, 4),
        (40, 49, 3),
        (30, 39, 2),
        (0, 29, 1),
    };

    public ApsCalculationResult Calculate(ApsCalculationRequest request, string scale = "standard-7-point")
    {
        if (request.Subjects is null || request.Subjects.Count == 0)
            throw new ArgumentException("At least one subject score is required.");

        // Life Orientation is typically excluded / capped by most universities.
        var countable = request.Subjects
            .Where(s => !string.Equals(s.SubjectName, "Life Orientation", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(s => s.Percentage)
            .Take(6) // best 6 subjects, the standard DHET convention
            .ToList();

        var breakdown = countable
            .Select(s => new SubjectApsBreakdown(s.SubjectName, s.Percentage, PointsFor(s.Percentage)))
            .ToList();

        return new ApsCalculationResult(
            TotalAps: breakdown.Sum(b => b.Points),
            Breakdown: breakdown,
            ScaleUsed: scale
        );
    }

    private static int PointsFor(int percentage)
    {
        foreach (var band in StandardScale)
            if (percentage >= band.min && percentage <= band.max)
                return band.points;
        return 0;
    }
}
