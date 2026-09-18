namespace CareerAdvisor.Api.DTOs;

// Mirrors buildSmsSummary's full input shape (frontend/src/engines/smsSummary.js).
// That function depends on the frontend's own mock qualifications/providers data,
// which has no backend equivalent — so this is a pure text-formatting endpoint:
// the caller resolves everything (provider names, career-choice/job-fit results,
// saved favourites) before calling, and this just formats it, the same as the
// frontend does today.

public record SmsLearnerDto(string Name, int Grade);

public record SmsCareerChoiceDto(string[] Code, List<SmsCareerMatchDto> Matches);
public record SmsCareerMatchDto(string Title);

public record SmsJobFitDto(List<SmsJobFitMatchDto> Matches);
public record SmsJobFitMatchDto(string Title, int Fit);

public record SmsPackageDto(string[] Subjects);

public record SmsMatchedQualificationDto(string Title, string ProviderName, int MinAps, string Deadline);

public record SmsSavedFavouriteDto(string Title, string Deadline);

public record SmsProfileDto(
    SmsCareerChoiceDto? CareerChoice,
    SmsJobFitDto? JobFit,
    List<SmsSavedFavouriteDto> Favourites
);

public record SmsSummaryRequest(
    SmsLearnerDto Learner,
    int Aps,
    List<SmsMatchedQualificationDto> Matched,
    List<SmsPackageDto>? Packages,
    SmsProfileDto Profile
);
