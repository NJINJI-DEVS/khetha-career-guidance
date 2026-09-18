namespace CareerAdvisor.Api.DTOs;

// HelpRequest itself only stores MatriculantId/MentorId — neither side can look up
// the other's name via any other endpoint (MatriculantsController.GetMine is
// caller-scoped only), so this DTO denormalizes what the UI actually needs to
// display, built via a join in the controller rather than exposed as a gap the
// frontend has to work around.
public record HelpRequestDto(
    Guid Id,
    Guid MatriculantId,
    Guid MentorId,
    string Subject,
    string Goal,
    string Need,
    string Status,
    DateTime SentAt,
    DateTime? RespondedAt,
    int AttachedAps,
    string AttachedMarksSummary,
    string LearnerName,
    int? LearnerGrade,
    string MentorName,
    bool HasLetter
);
