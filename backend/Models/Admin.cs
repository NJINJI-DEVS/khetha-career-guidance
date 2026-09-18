namespace CareerAdvisor.Api.Models;

// Supabase owns the login credentials. This table owns administrator access.
public class Admin
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
