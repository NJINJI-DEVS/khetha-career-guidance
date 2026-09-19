namespace CareerAdvisor.Api.Models;

/// <summary>
/// A learner's CV. One working document per account — learners at this stage
/// have one CV they keep improving, not a portfolio of versions, and a single
/// row keeps the wizard's autosave trivial.
///
/// Payload is opaque jsonb, the same pattern as Matriculant.ProfileData. The
/// wizard's shape will change as steps are added and reworded; storing it as a
/// document means that costs a frontend deploy rather than a migration.
///
/// PERSONAL DATA: a CV is the most sensitive record this app holds — full name,
/// phone, email, school history, sometimes an address. Two consequences are
/// enforced here rather than left to the client:
///   - ShareToken is null until the learner explicitly publishes, and clearing
///     it revokes the link immediately.
///   - The share endpoint returns a redacted projection, never the raw row.
/// </summary>
public class CvDocument
{
    public Guid UserId { get; set; }

    /// <summary>Wizard state as JSON. Never inspected by the backend.</summary>
    public string Payload { get; set; } = "{}";

    /// <summary>"classic" | "modern" — both ATS-safe single-column layouts.</summary>
    public string Template { get; set; } = "classic";

    /// <summary>
    /// Unguessable token for the public link. Null means the CV is private,
    /// which is the default and the state it returns to when revoked.
    /// </summary>
    public string? ShareToken { get; set; }

    /// <summary>0-100, computed client-side by engines/cvScore.js and stored so
    /// the Student Analytics dashboard can show it without parsing the payload.</summary>
    public int Completeness { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
