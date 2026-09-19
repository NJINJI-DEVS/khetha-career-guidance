namespace CareerAdvisor.Api.DTOs;

// Deliberately only metrics with a genuine backing table — no usage-pattern
// telemetry exists (no session/event tracking), so those fields simply aren't
// here rather than being padded with fake zeros. See PROJECT-CONTEXT.md /
// nested-churning-hellman.md for what was explicitly left out and why.

public record ProvinceCountDto(string Province, int Count);
public record VerificationMethodCountDto(string Method, int Count);
public record LabelCountDto(string Label, int Count);
public record DailyCountDto(DateOnly Day, int Count);

/// <summary>Who is on the platform, by the role their account is bound to.</summary>
public record RoleBreakdownDto(
    int Students, int Mentors, int Professionals, int Admins, int Unassigned, int Total);

/// <summary>
/// Signup trend. `AveragePerDay` is over the window rather than all time, so a
/// quiet week is visible instead of being flattened by launch-day numbers.
/// </summary>
public record GrowthDto(
    int NewLast7Days, int NewLast30Days, double AveragePerDayLast30, List<DailyCountDto> DailySignups);

/// <summary>
/// Mentor pipeline: what is waiting on an administrator, and how fast decisions
/// are being made. OldestPendingDays is the number that matters — an application
/// sitting for three weeks is a learner not being reached.
/// </summary>
public record MentorPipelineDto(
    int Pending, int Approved, int Declined, int ActiveMentors,
    int? OldestPendingDays, double? MedianDaysToDecision,
    int PendingEvents, int ApprovedEvents, int UpcomingEvents);

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
    List<VerificationMethodCountDto> VerificationMix,
    RoleBreakdownDto Roles,
    GrowthDto Growth,
    MentorPipelineDto Pipeline,
    List<LabelCountDto> DeviceMix,
    List<LabelCountDto> PlatformMix,
    List<LabelCountDto> GradeMix
);
