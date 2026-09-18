namespace CareerAdvisor.Api.DTOs;

// Deliberately only metrics with a genuine backing table — no usage-pattern
// telemetry exists (no session/event tracking), so those fields simply aren't
// here rather than being padded with fake zeros. See PROJECT-CONTEXT.md /
// nested-churning-hellman.md for what was explicitly left out and why.

public record ProvinceCountDto(string Province, int Count);
public record VerificationMethodCountDto(string Method, int Count);

public record AdminAnalyticsResponse(
    int TotalMatriculants,
    List<ProvinceCountDto> MatriculantsByProvince,
    double? AverageAps,
    int PendingApplications,
    int ApprovedMentors,
    int RejectedApplications,
    int PendingHelpRequests,
    int AcceptedHelpRequests,
    int DeclinedHelpRequests,
    int RecommendationLettersIssued,
    List<VerificationMethodCountDto> VerificationMix
);
