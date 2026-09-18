using System.Text.Json.Serialization;

namespace CareerAdvisor.Api.Models;

/// <summary>
/// A learner (matriculant) profile. Maps to the "matriculants" table in Supabase.
/// Supabase's built-in auth.users id (uuid) is stored as UserId so RLS policies
/// can restrict rows to auth.uid() = user_id.
/// </summary>
public class Matriculant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; } // FK -> Supabase auth.users.id
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int MatricYear { get; set; }
    public int? Grade { get; set; } // 9-12; kept as an explicit field rather than
                                     // derived from MatricYear to avoid a fragile
                                     // "current year vs matric year" calculation.
    public string? School { get; set; }
    public string Province { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // The learner's in-app journey state (favourited qualifications, saved
    // Career Choice/Job Fit/Subject Chooser results, which "next step" prompts
    // have been dismissed) — opaque JSON produced and consumed entirely by the
    // frontend (see frontend/src/context/ProfileContext.jsx). The backend
    // never reads its contents, just stores and returns it, so its shape can
    // evolve on the frontend without a migration here. Previously this only
    // ever lived in React state (reset on every reload) or an opt-in local
    // cache, which is why "Step 2 of 6" kept resetting for real users.
    public string? ProfileData { get; set; }

    public ICollection<MatriculantSubject> Subjects { get; set; } = new List<MatriculantSubject>();
}

/// <summary>A subject the matriculant took, with the percentage achieved.</summary>
public class MatriculantSubject
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MatriculantId { get; set; }

    // Back-reference only, for EF navigation — not serialized: Matriculant.Subjects
    // already contains this object, so round-tripping it here forms a cycle that
    // System.Text.Json can't serialize (throws on any request that returns a
    // Matriculant with subjects, e.g. GetMine/Create).
    [JsonIgnore]
    public Matriculant? Matriculant { get; set; }

    public string SubjectName { get; set; } = string.Empty; // e.g. "Mathematics"
    public int Percentage { get; set; } // 0-100
    public bool IsHomeLanguage { get; set; }
}
