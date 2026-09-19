namespace CareerAdvisor.Api.Models;

/// <summary>
/// A learner's place at an approved mentor event.
///
/// Its own table rather than a counter on the event, because a count cannot
/// answer the questions that actually come up on the day: who is coming, did
/// this learner already accept, and who do we tell if the venue changes. A
/// mentor expecting thirty learners needs the list, not the number.
///
/// Cancelling sets <see cref="Status"/> to "cancelled" and keeps the row. The
/// unique index is on (event, learner) alone, so a learner who cancels and
/// changes their mind reuses the same row instead of leaving a trail of
/// duplicates — and the mentor can still see that a seat was released rather
/// than never taken.
/// </summary>
public class MentorEventRegistration
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MentorEventId { get; set; }
    public MentorEvent? MentorEvent { get; set; }

    /// <summary>Supabase auth.users.id of the learner.</summary>
    public Guid LearnerUserId { get; set; }

    /// <summary>Copied at accept time so the mentor's attendee list reads
    /// without a join to a table this service does not own.</summary>
    public string LearnerName { get; set; } = string.Empty;

    public string? LearnerGrade { get; set; }
    public string? LearnerProvince { get; set; }

    /// <summary>"going" | "cancelled"</summary>
    public string Status { get; set; } = "going";

    public DateTime AcceptedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; set; }

    /// <summary>
    /// Set when the mentor marks the register after the event. Null means the
    /// day has not been recorded, which is different from "did not arrive".
    /// </summary>
    public bool? Attended { get; set; }
}
