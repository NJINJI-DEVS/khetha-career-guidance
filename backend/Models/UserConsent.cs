namespace CareerAdvisor.Api.Models;

/// <summary>
/// What a person agreed to let Khetha keep, and when.
///
/// This used to live only in React state, which meant two things: everyone was
/// asked again on every single sign-in, and the department held no record that
/// consent was ever given. For a POPIA feature whose entire purpose is provable
/// consent — including a guardian's consent for a minor — an unrecorded "yes"
/// is the same as no consent at all.
///
/// <see cref="Version"/> is what makes it safe to skip the question on later
/// logins: if the terms change, raising the current version re-asks everyone
/// rather than silently carrying an agreement to something they never saw.
/// </summary>
public class UserConsent
{
    /// <summary>Supabase auth.users.id. One row per account.</summary>
    public Guid UserId { get; set; }

    /// <summary>Required for the app to function at all — storing the career profile.</summary>
    public bool Core { get; set; }

    /// <summary>Optional: sync with the learner's existing NCAP record.</summary>
    public bool Ncap { get; set; }

    /// <summary>Optional: deadline and event reminders.</summary>
    public bool Notify { get; set; }

    /// <summary>Optional: anonymised use for departmental research.</summary>
    public bool Research { get; set; }

    // ---- Guardian consent (learners only) -------------------------------
    // POPIA s35 treats a child's personal information as special: a minor
    // cannot consent for themselves. Only learners are asked, because mentors
    // and departmental staff are adults by the nature of the account.

    public bool IsMinor { get; set; }
    public string? GuardianName { get; set; }
    public string? GuardianRelation { get; set; }
    public string? GuardianContact { get; set; }

    /// <summary>
    /// The consent text version the person actually saw. Bump
    /// <see cref="CurrentVersion"/> when the wording or the items change.
    /// </summary>
    public int Version { get; set; } = CurrentVersion;

    public DateTime AcceptedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    /// <summary>Raise this to re-ask everyone at their next sign-in.</summary>
    public const int CurrentVersion = 1;
}
