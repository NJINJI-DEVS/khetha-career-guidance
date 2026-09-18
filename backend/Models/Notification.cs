namespace CareerAdvisor.Api.Models;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Target { get; set; } // deep-link key, e.g. "advice", "qual:xyz"
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Accountability log for mentor-hub decisions (approvals, rejections). Only the
/// backend's own superuser connection ever reads/writes this table — RLS is
/// enabled on it with zero policies (default-deny for anon/authenticated).
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = string.Empty; // e.g. "application.approved"
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Server-side role assignment (e.g. "admin"). The frontend's `role` state is pure
/// UI navigation with no enforcement — this table is the real authorization source
/// for anything gated by [Authorize(Policy = "AdminOnly")].
/// </summary>
public class UserRole
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
}
