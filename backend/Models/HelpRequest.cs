using System.Text.Json.Serialization;

namespace CareerAdvisor.Api.Models;

/// <summary>A structured help request from a learner to an approved mentor.</summary>
public class HelpRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid MatriculantId { get; set; }
    [JsonIgnore]
    public Matriculant? Matriculant { get; set; }

    public Guid MentorId { get; set; }
    [JsonIgnore]
    public Mentor? Mentor { get; set; }

    public string Subject { get; set; } = string.Empty;
    public string Goal { get; set; } = string.Empty;
    public string Need { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // "pending" | "accepted" | "declined"
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? RespondedAt { get; set; }

    // Snapshotted at send time, so a later APS/marks change doesn't rewrite history.
    public int AttachedAps { get; set; }
    public string AttachedMarksSummary { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}

/// <summary>
/// A message on a help-request thread. Body is already redacted server-side
/// before this row is ever persisted (see RedactionService) — a modified client
/// cannot bypass this since redaction never happens client-side.
/// </summary>
public class Message
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid HelpRequestId { get; set; }
    [JsonIgnore]
    public HelpRequest? HelpRequest { get; set; }

    // Set server-side from the JWT's sub claim and from which side of the
    // HelpRequest the caller is on — never accepted from the request body.
    public Guid SenderUserId { get; set; }
    public string SenderRole { get; set; } = string.Empty; // "learner" | "mentor"

    public string Body { get; set; } = string.Empty;
    public string[] RedactedTypes { get; set; } = Array.Empty<string>();
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}

public class RecommendationLetter
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid HelpRequestId { get; set; }
    [JsonIgnore]
    public HelpRequest? HelpRequest { get; set; }

    public Guid IssuedByMentorId { get; set; }
    [JsonIgnore]
    public Mentor? IssuedByMentor { get; set; }

    public string Strength { get; set; } = string.Empty; // "strong" | "qualified" | "factual"
    public string Body { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
}
