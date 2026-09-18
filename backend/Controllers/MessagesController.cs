using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

public record SendMessageDto(Guid HelpRequestId, string Body);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IRedactionService _redaction;
    public MessagesController(AppDbContext db, IRedactionService redaction)
    {
        _db = db;
        _redaction = redaction;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    [HttpGet("for-request/{helpRequestId}")]
    public async Task<ActionResult<List<Message>>> ForRequest(Guid helpRequestId, CancellationToken ct)
    {
        var access = await CheckAccessAsync(helpRequestId, ct);
        if (access is null) return Forbid();

        var messages = await _db.Messages
            .Where(m => m.HelpRequestId == helpRequestId)
            .OrderBy(m => m.SentAt)
            .ToListAsync(ct);
        return Ok(messages);
    }

    /// <summary>Sends a message. Redaction runs here, server-side, before the row is
    /// ever persisted — a modified client cannot bypass this (see PROJECT-CONTEXT.md).
    /// Sender identity is derived from the JWT + which side of the thread the caller
    /// is on, never accepted from the request body. Only allowed once the request has
    /// been accepted.</summary>
    [HttpPost("send")]
    public async Task<ActionResult<Message>> Send([FromBody] SendMessageDto body, CancellationToken ct)
    {
        var helpRequest = await _db.HelpRequests.FirstOrDefaultAsync(h => h.Id == body.HelpRequestId, ct);
        if (helpRequest is null) return NotFound();
        if (helpRequest.Status != "accepted")
            return Conflict(new { error = "Messaging is only available once the mentor has accepted this request." });

        var access = await CheckAccessAsync(body.HelpRequestId, ct);
        if (access is null) return Forbid();
        var (senderRole, recipientUserId) = access.Value;

        var (redactedText, foundTypes) = _redaction.Redact(body.Body ?? "");

        var message = new Message
        {
            Id = Guid.NewGuid(),
            HelpRequestId = body.HelpRequestId,
            SenderUserId = CurrentUserId,
            SenderRole = senderRole,
            Body = redactedText,
            RedactedTypes = foundTypes,
            SentAt = DateTime.UtcNow,
        };
        _db.Messages.Add(message);

        _db.Notifications.Add(new Notification
        {
            UserId = recipientUserId,
            Title = "New message",
            Body = redactedText.Length > 80 ? redactedText[..80] + "…" : redactedText,
            Target = "mentors",
        });

        await _db.SaveChangesAsync(ct);
        return Ok(message);
    }

    /// <summary>Confirms the caller is a party to this help request and returns
    /// (their role on the thread, the other party's user id) — or null if they're
    /// not a party to it at all.</summary>
    private async Task<(string SenderRole, Guid RecipientUserId)?> CheckAccessAsync(Guid helpRequestId, CancellationToken ct)
    {
        var req = await _db.HelpRequests.FirstOrDefaultAsync(h => h.Id == helpRequestId, ct);
        if (req is null) return null;

        var matriculant = await _db.Matriculants.FirstOrDefaultAsync(m => m.Id == req.MatriculantId, ct);
        var mentor = await _db.Mentors.FirstOrDefaultAsync(m => m.Id == req.MentorId, ct);

        if (matriculant?.UserId == CurrentUserId) return ("learner", mentor!.UserId);
        if (mentor?.UserId == CurrentUserId) return ("mentor", matriculant!.UserId);
        return null;
    }
}
