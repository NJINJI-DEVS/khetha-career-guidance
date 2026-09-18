namespace CareerAdvisor.Api.DTOs;

/// <summary>
/// Shaped to what the careers page actually renders, so the frontend can drop
/// its hardcoded occupations list without a translation layer. Field names match
/// the existing frontend data/occupations.js objects on purpose.
///
/// `Id` is the OFO code rather than a surrogate GUID: learner favourites are
/// stored as bare id strings, so a stable, meaningful id is what keeps a saved
/// favourite valid across a re-import.
/// </summary>
public record OccupationDto(
    string Id,
    string Ofo,
    string Title,
    string? Summary,
    string? Field,
    List<string> Riasec,
    List<string> Subjects,
    List<string> Tasks,
    string? Demand,
    string? Salary,
    int? SalaryMin,
    int? SalaryMax,
    OccupationContextDto Context,
    string MajorGroup,
    string SubMinorGroup,
    string? Description,
    string? Link,
    OccupationProvenanceDto Provenance,
    List<OccupationQualificationDto> Quals);

/// <summary>The five Job Fit axes, each 0-4.</summary>
public record OccupationContextDto(int People, int Data, int Things, int Outdoors, int Routine);

/// <summary>
/// Lets the UI state plainly what is official and what is machine-generated —
/// the build checklist's content-provenance requirement. `Official` covers the
/// code, title, groups and description; everything else came from the model
/// named here.
/// </summary>
public record OccupationProvenanceDto(string Source, string? EnrichmentModel, DateTime? EnrichedAt, DateTime LastSyncedAt);

/// <summary>A qualification linked to this occupation via Course.OfoCode.</summary>
public record OccupationQualificationDto(Guid CourseId, string Title, string University, string FacultyName, int MinimumAps);

public record PagedResult<T>(List<T> Items, int Page, int PageSize, int Total, int TotalPages);

public record OccupationImportResult(
    int RowsParsed, int RecordsImported, List<string> Warnings, string[] DetectedHeaders);

public record OccupationCatalogueStatus(
    int Total, int Published, int AwaitingEnrichment, bool GeminiConfigured, DateTime? LastImportAt, DateTime? LastEnrichmentAt);
