namespace CareerAdvisor.Api.Models;

/// <summary>
/// What a learner has told us about themselves and how they want the service to
/// behave. Stored as a jsonb column on `matriculants` (EF `ToJson`).
///
/// Deliberately kept separate from <see cref="Matriculant.ProfileData"/>, which
/// the backend treats as an opaque blob. The distinction is meaningful:
///
///   ProfileData  = journey state the app produced   (which prompts were
///                  dismissed, saved questionnaire results)
///   Preferences  = declarations the learner made    (fields of interest,
///                  province, notification and accessibility choices)
///
/// Preferences are typed because the backend acts on them — deadline reminders
/// read the notification flags — and because DHET can answer real questions
/// from them ("which fields are Limpopo learners asking about?") without
/// parsing a frontend-defined blob.
///
/// Every field has a usable default, so a learner who skips onboarding entirely
/// still gets a working app rather than a null-checked one.
/// </summary>
public class LearnerPreferences
{
    // ---- What they are looking for --------------------------------------
    /// <summary>Career field keys, matching the frontend's FIELD catalogue.</summary>
    public List<string> FieldsOfInterest { get; set; } = new();

    /// <summary>Free-text goals, or OFO codes for saved occupations.</summary>
    public List<string> CareerGoals { get; set; } = new();

    /// <summary>"grade9" | "grade10" | "grade11" | "matric" | "tvet" | "university" | "working"</summary>
    public string? EducationLevel { get; set; }

    /// <summary>Where they want to study, which may differ from where they live.</summary>
    public string? PreferredProvince { get; set; }

    /// <summary>"fulltime" | "parttime" | "distance" | "any"</summary>
    public string StudyMode { get; set; } = "any";

    /// <summary>
    /// How far they can realistically travel to study. For many learners this
    /// is the binding constraint, not marks, so it filters provider results.
    /// </summary>
    public int? MaxTravelKm { get; set; }

    // ---- How they want the app to behave --------------------------------
    public string Language { get; set; } = "en";

    /// <summary>"system" | "light" | "dark"</summary>
    public string ThemeMode { get; set; } = "system";

    public bool NotifyDeadlines { get; set; } = true;
    public bool NotifyEvents { get; set; } = true;
    public bool NotifyNsfas { get; set; } = true;
    public bool NotifyMentorReplies { get; set; } = true;

    // ---- Accessibility ---------------------------------------------------
    // Stored server-side rather than per-device: a learner who needs larger
    // text needs it on the school computer too, not only on the phone where
    // they happened to set it.
    public double TextScale { get; set; } = 1;
    public bool HighContrast { get; set; }
    public bool ReduceMotion { get; set; }
    public bool SimpleLanguage { get; set; }
    public bool ReadAloud { get; set; }

    // ---- Offline ---------------------------------------------------------
    public bool SaveOffline { get; set; }

    /// <summary>
    /// Set whenever preferences are written. Its absence is how the app knows
    /// onboarding preferences have never been captured, so it can ask once —
    /// and only once.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}
