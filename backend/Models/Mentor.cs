using System.Text.Json.Serialization;

namespace CareerAdvisor.Api.Models;

/// <summary>
/// An approved mentor/professional profile, created when a MentorApplication is
/// approved. UserId is Supabase's auth.users id (uuid), stored plain per the
/// Matriculant.UserId precedent — Supabase's auth schema isn't mapped here.
/// </summary>
public class Mentor
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // "mentor" | "professional"
    public string Field { get; set; } = string.Empty;
    public string[] Subjects { get; set; } = Array.Empty<string>();
    public string Province { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string InstitutionOrEmployer { get; set; } = string.Empty;
    public string WorkEmail { get; set; } = string.Empty;
    public string[] VerificationTiers { get; set; } = Array.Empty<string>();
    public string Bio { get; set; } = string.Empty;
    public double? Rating { get; set; }
    public int SessionsCompleted { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>The application (and its risk score) that produced this mentor.</summary>
    public Guid SourceApplicationId { get; set; }
    [JsonIgnore]
    public MentorApplication? SourceApplication { get; set; }
}

/// <summary>A single finding from the risk-flag engine, stored as jsonb.</summary>
public record RiskFlag(string Level, string Title, string Detail);

public class MentorApplication
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty; // "mentor" | "professional"
    public string FullName { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
    public string? IdDocumentFilename { get; set; }
    public string WorkEmail { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string LinkedIn { get; set; } = string.Empty;
    public string LicenceBody { get; set; } = string.Empty; // "none" | "sace" | "saica" | "ecsa" | "hpcsa"
    public string LicenceNumber { get; set; } = string.Empty;
    public bool ClaimsTeacher { get; set; }
    public string PartnerCode { get; set; } = string.Empty;
    public string? PartnerName { get; set; }
    public string? TranscriptFilename { get; set; }
    public string Field { get; set; } = string.Empty;
    public string[] Subjects { get; set; } = Array.Empty<string>();
    public string Claim { get; set; } = string.Empty;
    public int SubmitSeconds { get; set; }
    public string? DuplicateOf { get; set; }
    public string? SubjectMismatch { get; set; }

    public string Status { get; set; } = "pending"; // "pending" | "approved" | "rejected"
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DecidedAt { get; set; }
    public Guid? DecidedByUserId { get; set; }

    // Computed server-side at submission time by RiskFlagsService — never
    // recomputed on read, never accepted from the client.
    public int RiskScore { get; set; }
    public string RiskVerdict { get; set; } = "clear"; // "clear" | "low" | "medium" | "high"
    public List<RiskFlag> RiskFlags { get; set; } = new();
}
