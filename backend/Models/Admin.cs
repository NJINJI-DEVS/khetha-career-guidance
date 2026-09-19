namespace CareerAdvisor.Api.Models;

/// <summary>
/// A platform administrator. Maps to the "admins" table.
///
/// This is the authorization record for admin rights, separate from
/// <see cref="UserRole"/>. UserRole answers "what kind of account is this" and
/// drives navigation; this table answers "may this person approve a mentor, let
/// an adult meet learners, or grant admin to someone else" — and it keeps the
/// audit trail that question deserves: who granted it, when, who revoked it and
/// why.
///
/// Rights are flat: every active administrator can do everything. There is no
/// permission matrix because there is no second kind of administrator yet, and
/// a matrix nobody varies is just columns that are always true. If a
/// review-only role is ever needed, it goes here as explicit flags.
///
/// Revoking sets IsActive false and keeps the row. Deleting it would erase the
/// record that the person ever held rights, which is exactly what an audit
/// trail exists to prevent.
/// </summary>
public class Admin
{
    /// <summary>Supabase auth.users.id — the primary key. One admin row per account.</summary>
    public Guid UserId { get; set; }

    /// <summary>Copied from the JWT at grant time so the admin list is readable
    /// without joining across to auth.users on every request.</summary>
    public string Email { get; set; } = string.Empty;

    public string? DisplayName { get; set; }

    /// <summary>False once revoked. The authorization handler requires true.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// When the row was created. Part of the original table; kept because it is
    /// NOT NULL there and existing rows already carry a meaningful value.
    /// GrantedAt is the one that moves when rights are reinstated.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Null for the bootstrap administrator — nobody granted it, the
    /// configured bootstrap email did, which is itself worth being able to see.</summary>
    public Guid? GrantedByUserId { get; set; }
    public string? GrantedByEmail { get; set; }

    /// <summary>How the rights were obtained: "bootstrap" or "granted".</summary>
    public string GrantedVia { get; set; } = "granted";

    public DateTime? RevokedAt { get; set; }
    public Guid? RevokedByUserId { get; set; }

    /// <summary>Free text on the grant or the revocation.</summary>
    public string? Note { get; set; }

    /// <summary>Updated on each admin-authenticated request, so a dormant
    /// administrator account is visible and can be revoked.</summary>
    public DateTime? LastSeenAt { get; set; }
}
