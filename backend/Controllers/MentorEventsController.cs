using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

public record MentorEventRequest(
    string Kind, string Title, string Description, string Impact,
    DateTime StartsAt, DateTime? EndsAt, string Venue, string Province,
    int? Capacity, bool IsOnline);

public record MentorEventDecision(string? Note);

/// <summary>
/// An event as a learner sees it: the event plus the two things that decide
/// whether they can act on it — how many places are left, and whether they have
/// already taken one.
/// </summary>
public record MentorEventView(
    Guid Id, string Kind, string Title, string Description, string Impact,
    DateTime StartsAt, DateTime? EndsAt, string Venue, string Province,
    bool IsOnline, string MentorName, string MentorRole, string Status,
    int? Capacity, int SlotsTaken, int? SlotsLeft, bool IsFull, bool IsRegistered);

/// <summary>One attendee, for the mentor's register on the day.</summary>
public record EventAttendeeDto(
    Guid LearnerUserId, string LearnerName, string? LearnerGrade, string? LearnerProvince,
    string Status, DateTime AcceptedAt, bool? Attended);

/// <summary>
/// Seminars, work-shadowing days and site visits offered by approved mentors.
///
/// The approval gate is the point of this controller. An approved event puts an
/// adult in a room with learners, usually at a physical address, so an
/// administrator decides — not the mentor, and not the scheduler. Only approved
/// events are ever visible to a learner.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MentorEventsController : ControllerBase
{
    private static readonly string[] Kinds = { "seminar", "shadowing", "site_visit", "talk" };

    private readonly AppDbContext _db;
    public MentorEventsController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? throw new InvalidOperationException("Missing sub claim"));

    /// <summary>
    /// Requests an event. Only an approved, active mentor may ask: the whole
    /// point of the vetting flow is that unvetted adults cannot reach learners,
    /// and an open event request would be a way around it.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MentorEvent>> RequestEvent([FromBody] MentorEventRequest body, CancellationToken ct)
    {
        var mentor = await _db.Mentors.FirstOrDefaultAsync(m => m.UserId == CurrentUserId && m.IsActive, ct);
        if (mentor is null)
            return StatusCode(403, new { error = "Only approved mentors and professionals can request events." });

        if (string.IsNullOrWhiteSpace(body.Title)) return BadRequest(new { error = "Give the event a title." });
        if (string.IsNullOrWhiteSpace(body.Description)) return BadRequest(new { error = "Describe what the session covers." });
        if (string.IsNullOrWhiteSpace(body.Impact)) return BadRequest(new { error = "Say what learners get out of it." });
        if (string.IsNullOrWhiteSpace(body.Venue)) return BadRequest(new { error = "Give a venue, or joining details if it is online." });

        // Slots are required, not optional. A learner accepting an invitation is
        // being told a place is held for them, and without a number there is
        // nothing to hold — the mentor arrives to either an empty room or a
        // crowd they cannot host.
        if (body.Capacity is not > 0)
            return BadRequest(new { error = "Say how many learners you can take on the day." });
        if (body.Capacity > 1000)
            return BadRequest(new { error = "That is more learners than a single session can hold." });

        // A learner needs notice to arrange transport and permission, and an
        // administrator needs time to review. Same-day events help nobody.
        if (body.StartsAt <= DateTime.UtcNow.AddDays(2))
            return BadRequest(new { error = "Events must be at least two days ahead, so learners can plan and an administrator can review." });

        if (body.EndsAt is not null && body.EndsAt <= body.StartsAt)
            return BadRequest(new { error = "The end time must be after the start time." });

        var ev = new MentorEvent
        {
            MentorUserId = CurrentUserId,
            MentorName = mentor.FullName,
            MentorRole = mentor.Role,
            Kind = Kinds.Contains(body.Kind) ? body.Kind : "seminar",
            Title = body.Title.Trim(),
            Description = body.Description.Trim(),
            Impact = body.Impact.Trim(),
            StartsAt = body.StartsAt,
            EndsAt = body.EndsAt,
            Venue = body.Venue.Trim(),
            Province = (body.Province ?? mentor.Province ?? "").Trim(),
            Capacity = body.Capacity is > 0 ? body.Capacity : null,
            IsOnline = body.IsOnline,
            Status = "pending",
        };

        _db.MentorEvents.Add(ev);
        _db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = CurrentUserId,
            Action = "event.requested",
            EntityType = "mentor_event",
            EntityId = ev.Id,
            Details = $"kind={ev.Kind};startsAt={ev.StartsAt:O}",
        });

        await _db.SaveChangesAsync(ct);
        return Ok(ev);
    }

    /// <summary>
    /// The requesting mentor's own events, in any state, carrying how many
    /// places have been taken — a mentor planning a day needs the count more
    /// than they need the status they already know.
    /// </summary>
    [HttpGet("mine")]
    public async Task<ActionResult<List<MentorEventView>>> Mine(CancellationToken ct)
    {
        var events = await _db.MentorEvents
            .Where(e => e.MentorUserId == CurrentUserId)
            .OrderByDescending(e => e.StartsAt)
            .ToListAsync(ct);
        return Ok(await ToViewsAsync(events, ct));
    }

    [HttpGet("pending")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<List<MentorEvent>>> Pending(CancellationToken ct) =>
        Ok(await _db.MentorEvents
            .Where(e => e.Status == "pending")
            .OrderBy(e => e.StartsAt)
            .ToListAsync(ct));

    /// <summary>Every event an administrator might review, including decided ones.</summary>
    [HttpGet("all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<List<MentorEvent>>> All([FromQuery] string? status, CancellationToken ct)
    {
        var q = _db.MentorEvents.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) q = q.Where(e => e.Status == status);
        return Ok(await q.OrderByDescending(e => e.StartsAt).Take(200).ToListAsync(ct));
    }

    [HttpPost("{id}/approve")]
    [Authorize(Policy = "AdminOnly")]
    public Task<ActionResult<MentorEvent>> Approve(Guid id, [FromBody] MentorEventDecision? body, CancellationToken ct)
        => Decide(id, "approved", body?.Note, ct);

    [HttpPost("{id}/decline")]
    [Authorize(Policy = "AdminOnly")]
    public Task<ActionResult<MentorEvent>> Decline(Guid id, [FromBody] MentorEventDecision? body, CancellationToken ct)
        => Decide(id, "declined", body?.Note, ct);

    private async Task<ActionResult<MentorEvent>> Decide(Guid id, string status, string? note, CancellationToken ct)
    {
        var ev = await _db.MentorEvents.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (ev is null) return NotFound();
        if (ev.Status != "pending") return Conflict(new { error = "This event has already been decided." });

        ev.Status = status;
        ev.DecidedAt = DateTime.UtcNow;
        ev.DecidedByUserId = CurrentUserId;
        ev.DecisionNote = string.IsNullOrWhiteSpace(note) ? null : note.Trim();

        _db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = CurrentUserId,
            Action = $"event.{status}",
            EntityType = "mentor_event",
            EntityId = ev.Id,
            Details = ev.DecisionNote,
        });

        // The mentor is told either way. A decline without a reason cannot be
        // acted on, which is why the note is surfaced to them.
        _db.Notifications.Add(new Notification
        {
            UserId = ev.MentorUserId,
            Title = status == "approved"
                ? $"\"{ev.Title}\" was approved"
                : $"\"{ev.Title}\" was not approved",
            Body = status == "approved"
                ? "Learners can now see it in their calendar."
                : ev.DecisionNote ?? "An administrator did not approve this event.",
        });

        await _db.SaveChangesAsync(ct);
        return Ok(ev);
    }

    /// <summary>
    /// What a learner sees. Approved and still ahead only — a declined or past
    /// event has no business in a calendar.
    /// </summary>
    [HttpGet("upcoming")]
    public async Task<ActionResult<List<MentorEventView>>> Upcoming(
        [FromQuery] string? province, [FromQuery] int days = 120, CancellationToken ct = default)
    {
        var horizon = DateTime.UtcNow.AddDays(Math.Clamp(days, 1, 365));
        var q = _db.MentorEvents
            .Where(e => e.Status == "approved" && e.StartsAt >= DateTime.UtcNow && e.StartsAt <= horizon);

        // Online events reach everyone, so a province filter must not hide them.
        if (!string.IsNullOrWhiteSpace(province))
            q = q.Where(e => e.IsOnline || e.Province == province);

        var events = await q.OrderBy(e => e.StartsAt).Take(100).ToListAsync(ct);
        return Ok(await ToViewsAsync(events, ct));
    }

    /// <summary>
    /// The events this learner has accepted - what their calendar shows as
    /// theirs, as opposed to what is merely on offer. Recently past events are
    /// kept briefly so the day itself does not vanish from the calendar at
    /// midnight while they are still travelling home.
    /// </summary>
    [HttpGet("registered")]
    public async Task<ActionResult<List<MentorEventView>>> Registered(CancellationToken ct)
    {
        var since = DateTime.UtcNow.AddDays(-2);
        var events = await _db.MentorEventRegistrations
            .Where(r => r.LearnerUserId == CurrentUserId && r.Status == "going")
            .Include(r => r.MentorEvent)
            .Select(r => r.MentorEvent!)
            .Where(e => e.Status == "approved" && e.StartsAt >= since)
            .OrderBy(e => e.StartsAt)
            .ToListAsync(ct);

        return Ok(await ToViewsAsync(events, ct));
    }

    /// <summary>
    /// Takes a place at an approved event.
    ///
    /// The capacity check and the insert happen inside one transaction with the
    /// event row locked, because without that two learners accepting the last
    /// place at the same moment both read "1 left" and both succeed - and a
    /// mentor who was promised thirty finds thirty-one at the door.
    /// </summary>
    [HttpPost("{id}/accept")]
    public async Task<ActionResult<MentorEventView>> Accept(Guid id, CancellationToken ct)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        // FOR UPDATE serialises concurrent accepts on this one event; callers
        // for other events are unaffected.
        var ev = await _db.MentorEvents
            .FromSqlRaw("select * from mentor_events where id = {0} for update", id)
            .FirstOrDefaultAsync(ct);

        if (ev is null) return NotFound();
        if (ev.Status != "approved")
            return BadRequest(new { error = "This event is not open for registration." });
        if (ev.StartsAt <= DateTime.UtcNow)
            return BadRequest(new { error = "This event has already started." });

        var existing = await _db.MentorEventRegistrations
            .FirstOrDefaultAsync(r => r.MentorEventId == id && r.LearnerUserId == CurrentUserId, ct);
        if (existing is { Status: "going" })
            return Conflict(new { error = "You have already accepted this invitation." });

        var taken = await _db.MentorEventRegistrations
            .CountAsync(r => r.MentorEventId == id && r.Status == "going", ct);
        if (ev.Capacity is int cap && taken >= cap)
            return Conflict(new { error = "This event is full. Places may open up if someone cancels." });

        // The learner's own profile supplies the details the mentor needs on the
        // day. Read here rather than trusted from the request body.
        var profile = await _db.Matriculants.FirstOrDefaultAsync(m => m.UserId == CurrentUserId, ct);

        if (existing is not null)
        {
            existing.Status = "going";
            existing.AcceptedAt = DateTime.UtcNow;
            existing.CancelledAt = null;
        }
        else
        {
            _db.MentorEventRegistrations.Add(new MentorEventRegistration
            {
                MentorEventId = id,
                LearnerUserId = CurrentUserId,
                LearnerName = profile?.FullName ?? "Khetha learner",
                LearnerGrade = profile?.Grade is int g ? $"Grade {g}" : null,
                LearnerProvince = profile?.Province,
                Status = "going",
                AcceptedAt = DateTime.UtcNow,
            });
        }

        // Confirms it is theirs, and gives the reminder something to hang off in
        // their notifications list.
        _db.Notifications.Add(new Notification
        {
            UserId = CurrentUserId,
            Title = $"You are going to {ev.Title}",
            Body = $"{ev.StartsAt:ddd d MMM, HH:mm} - {ev.Venue}",
            Target = "calendar",
        });

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return Ok((await ToViewsAsync(new List<MentorEvent> { ev }, ct))[0]);
    }

    /// <summary>
    /// Releases a place. A status change rather than a delete, so the mentor can
    /// see a seat was given up and the freed place genuinely returns to the pool.
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<MentorEventView>> CancelRegistration(Guid id, CancellationToken ct)
    {
        var reg = await _db.MentorEventRegistrations
            .FirstOrDefaultAsync(r => r.MentorEventId == id && r.LearnerUserId == CurrentUserId, ct);
        if (reg is null || reg.Status != "going") return NotFound();

        reg.Status = "cancelled";
        reg.CancelledAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        var ev = await _db.MentorEvents.FirstAsync(e => e.Id == id, ct);
        return Ok((await ToViewsAsync(new List<MentorEvent> { ev }, ct))[0]);
    }

    /// <summary>
    /// The register for one event. Restricted to the mentor hosting it and to
    /// administrators: it is a list of named minors with their grade and
    /// province, which nobody else has business reading.
    /// </summary>
    [HttpGet("{id}/attendees")]
    public async Task<ActionResult<List<EventAttendeeDto>>> Attendees(Guid id, CancellationToken ct)
    {
        var ev = await _db.MentorEvents.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (ev is null) return NotFound();

        var isAdmin = await _db.Admins.AnyAsync(a => a.UserId == CurrentUserId && a.IsActive, ct);
        if (ev.MentorUserId != CurrentUserId && !isAdmin) return Forbid();

        var rows = await _db.MentorEventRegistrations
            .Where(r => r.MentorEventId == id)
            .OrderBy(r => r.AcceptedAt)
            .ToListAsync(ct);

        return Ok(rows.Select(r => new EventAttendeeDto(
            r.LearnerUserId, r.LearnerName, r.LearnerGrade, r.LearnerProvince,
            r.Status, r.AcceptedAt, r.Attended)).ToList());
    }

    /// <summary>
    /// Attaches slot counts and this caller's own registration state to a set of
    /// events, in two queries rather than two per event.
    /// </summary>
    private async Task<List<MentorEventView>> ToViewsAsync(List<MentorEvent> events, CancellationToken ct)
    {
        if (events.Count == 0) return new List<MentorEventView>();
        var ids = events.Select(e => e.Id).ToList();

        var counts = await _db.MentorEventRegistrations
            .Where(r => ids.Contains(r.MentorEventId) && r.Status == "going")
            .GroupBy(r => r.MentorEventId)
            .Select(g => new { EventId = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var mine = await _db.MentorEventRegistrations
            .Where(r => ids.Contains(r.MentorEventId)
                        && r.LearnerUserId == CurrentUserId && r.Status == "going")
            .Select(r => r.MentorEventId)
            .ToListAsync(ct);

        return events.Select(e =>
        {
            var taken = counts.FirstOrDefault(c => c.EventId == e.Id)?.Count ?? 0;
            int? left = e.Capacity is int cap ? Math.Max(0, cap - taken) : null;
            return new MentorEventView(
                e.Id, e.Kind, e.Title, e.Description, e.Impact, e.StartsAt, e.EndsAt,
                e.Venue, e.Province, e.IsOnline, e.MentorName, e.MentorRole, e.Status,
                e.Capacity, taken, left, left == 0, mine.Contains(e.Id));
        }).ToList();
    }
}
