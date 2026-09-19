namespace CareerAdvisor.Api.Models;

/// <summary>
/// Something a mentor or industry professional offers to learners: a seminar, a
/// work-shadowing day, a site visit, or an open invitation to see what the job
/// actually looks like.
///
/// WHY THESE NEED APPROVAL: an approved event puts an adult in a room with
/// learners, and often at a physical address. That is a safeguarding decision,
/// not a scheduling one — so a request states what it is, when, where, and what
/// learners get out of it, and an administrator decides. Nothing reaches a
/// learner's calendar unapproved.
///
/// The mentor is identified by UserId rather than a Mentor FK because the
/// application/approval flow already guarantees only approved mentors hold the
/// mentor or professional role, and keeping the event independent means a
/// deactivated mentor's past events stay readable.
/// </summary>
public class MentorEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MentorUserId { get; set; }
    /// <summary>Denormalised so the admin queue and learner calendar render
    /// without joining, and so a past event still shows who ran it.</summary>
    public string MentorName { get; set; } = string.Empty;
    public string MentorRole { get; set; } = string.Empty;   // "mentor" | "professional"

    /// <summary>"seminar" | "shadowing" | "site_visit" | "talk"</summary>
    public string Kind { get; set; } = "seminar";

    public string Title { get; set; } = string.Empty;

    /// <summary>What the session actually covers.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>What a learner walks away with. Required, because an event that
    /// cannot answer this is not worth a learner's transport money.</summary>
    public string Impact { get; set; } = string.Empty;

    public DateTime StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }

    public string Venue { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    /// <summary>Null means no cap.</summary>
    public int? Capacity { get; set; }

    /// <summary>True for an online session, where Venue holds the joining detail.</summary>
    public bool IsOnline { get; set; }

    /// <summary>"pending" | "approved" | "declined" | "cancelled"</summary>
    public string Status { get; set; } = "pending";

    public DateTime? DecidedAt { get; set; }
    public Guid? DecidedByUserId { get; set; }
    /// <summary>Given to the mentor on decline, so a request can be fixed and
    /// resubmitted rather than silently refused.</summary>
    public string? DecisionNote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
