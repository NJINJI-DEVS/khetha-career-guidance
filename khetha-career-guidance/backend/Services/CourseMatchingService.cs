using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Services;

public interface ICourseMatchingService
{
    Task<List<CourseMatchDto>> FindMatchesAsync(CourseMatchRequest request, CancellationToken ct = default);
}

/// <summary>
/// Matches a learner's subject percentages + computed APS against the courses
/// catalogue, flagging which courses they currently qualify for and, for the ones
/// they don't, exactly which subject/percentage requirements are unmet.
/// </summary>
public class CourseMatchingService : ICourseMatchingService
{
    private readonly AppDbContext _db;
    private readonly IApsCalculatorService _apsCalculator;

    public CourseMatchingService(AppDbContext db, IApsCalculatorService apsCalculator)
    {
        _db = db;
        _apsCalculator = apsCalculator;
    }

    public async Task<List<CourseMatchDto>> FindMatchesAsync(CourseMatchRequest request, CancellationToken ct = default)
    {
        var apsResult = _apsCalculator.Calculate(new ApsCalculationRequest(request.Subjects));
        var subjectScores = request.Subjects.ToDictionary(s => s.SubjectName, s => s.Percentage, StringComparer.OrdinalIgnoreCase);

        var query = _db.Courses
            .Include(c => c.University)
            .Include(c => c.SubjectRequirements)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.ProvinceFilter))
            query = query.Where(c => c.University!.Province == request.ProvinceFilter);

        if (!string.IsNullOrWhiteSpace(request.FacultyFilter))
            query = query.Where(c => c.FacultyName == request.FacultyFilter);

        var courses = await query.ToListAsync(ct);

        var ofoLookup = await _db.OfoCodes.ToDictionaryAsync(o => o.Code, o => o.Title, ct);

        var results = new List<CourseMatchDto>();

        foreach (var course in courses)
        {
            var unmet = new List<string>();

            if (apsResult.TotalAps < course.MinimumAps)
                unmet.Add($"APS {apsResult.TotalAps} below required {course.MinimumAps}");

            // Group requirements by AlternativeGroupKey so "Maths OR Maths Literacy" style
            // rules only need ONE of the group satisfied; ungrouped requirements are all compulsory.
            var grouped = course.SubjectRequirements
                .Where(r => r.AlternativeGroupKey != null)
                .GroupBy(r => r.AlternativeGroupKey);

            foreach (var group in grouped)
            {
                bool anySatisfied = group.Any(r =>
                    subjectScores.TryGetValue(r.SubjectName, out var pct) && pct >= r.MinimumPercentage);

                if (!anySatisfied)
                {
                    var options = string.Join(" or ", group.Select(g => $"{g.SubjectName} >= {g.MinimumPercentage}%"));
                    unmet.Add($"Need one of: {options}");
                }
            }

            foreach (var req in course.SubjectRequirements.Where(r => r.AlternativeGroupKey == null))
            {
                if (!subjectScores.TryGetValue(req.SubjectName, out var pct) || pct < req.MinimumPercentage)
                {
                    unmet.Add($"{req.SubjectName} >= {req.MinimumPercentage}% (you: {(subjectScores.TryGetValue(req.SubjectName, out var p) ? p + "%" : "not taken")})");
                }
            }

            ofoLookup.TryGetValue(course.OfoCode ?? string.Empty, out var ofoTitle);

            results.Add(new CourseMatchDto(
                CourseId: course.Id,
                CourseName: course.Name,
                UniversityName: course.University?.Name ?? "",
                FacultyName: course.FacultyName,
                MinimumAps: course.MinimumAps,
                ApplicantAps: apsResult.TotalAps,
                Qualifies: unmet.Count == 0,
                UnmetRequirements: unmet,
                LinkedOfoCode: course.OfoCode,
                LinkedOfoTitle: ofoTitle,
                SaqaQualificationId: course.SaqaQualificationId
            ));
        }

        return results
            .OrderByDescending(r => r.Qualifies)
            .ThenBy(r => r.UnmetRequirements.Count)
            .ToList();
    }
}
