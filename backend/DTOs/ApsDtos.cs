namespace CareerAdvisor.Api.DTOs;

public record SubjectScoreDto(string SubjectName, int Percentage, bool IsHomeLanguage = false);

public record ApsCalculationRequest(List<SubjectScoreDto> Subjects);

public record ApsCalculationResult(
    int TotalAps,
    List<SubjectApsBreakdown> Breakdown,
    string ScaleUsed
);

public record SubjectApsBreakdown(string SubjectName, int Percentage, int Points);

public record CourseMatchRequest(
    List<SubjectScoreDto> Subjects,
    string? ProvinceFilter = null,
    string? FacultyFilter = null
);

public record CourseMatchDto(
    Guid CourseId,
    string CourseName,
    string UniversityName,
    string FacultyName,
    int MinimumAps,
    int ApplicantAps,
    bool Qualifies,
    List<string> UnmetRequirements,
    string? LinkedOfoCode,
    string? LinkedOfoTitle,
    string? SaqaQualificationId
);
