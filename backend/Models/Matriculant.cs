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
    public string Province { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

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
