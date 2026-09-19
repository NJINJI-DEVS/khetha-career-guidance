using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.DTOs;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Controllers;

[ApiController]
[Route("api/admin/analytics")]
[Authorize(Policy = "AdminOnly")]
public class AdminAnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IApsCalculatorService _apsCalculator;
    public AdminAnalyticsController(AppDbContext db, IApsCalculatorService apsCalculator)
    {
        _db = db;
        _apsCalculator = apsCalculator;
    }

    [HttpGet]
    public async Task<ActionResult<AdminAnalyticsResponse>> Get(CancellationToken ct)
    {
        var matriculants = await _db.Matriculants.Include(m => m.Subjects).ToListAsync(ct);

        var byProvince = matriculants
            .Where(m => !string.IsNullOrWhiteSpace(m.Province))
            .GroupBy(m => m.Province)
            .Select(g => new ProvinceCountDto(g.Key, g.Count()))
            .OrderByDescending(p => p.Count)
            .ToList();

        var apsValues = matriculants
            .Where(m => m.Subjects.Count > 0)
            .Select(m => _apsCalculator.Calculate(new ApsCalculationRequest(
                m.Subjects.Select(s => new SubjectScoreDto(s.SubjectName, s.Percentage, s.IsHomeLanguage)).ToList())).TotalAps)
            .ToList();
        double? avgAps = apsValues.Count > 0 ? apsValues.Average() : null;

        var pendingApplications = await _db.MentorApplications.CountAsync(a => a.Status == "pending", ct);
        var approvedMentors = await _db.Mentors.CountAsync(m => m.IsActive, ct);
        var rejectedApplications = await _db.MentorApplications.CountAsync(a => a.Status == "rejected", ct);

        var pendingRequests = await _db.HelpRequests.CountAsync(h => h.Status == "pending", ct);
        var acceptedRequests = await _db.HelpRequests.CountAsync(h => h.Status == "accepted", ct);
        var declinedRequests = await _db.HelpRequests.CountAsync(h => h.Status == "declined", ct);

        var lettersIssued = await _db.RecommendationLetters.CountAsync(ct);

        var verificationMix = (await _db.Mentors.Select(m => m.VerificationTiers).ToListAsync(ct))
            .SelectMany(tiers => tiers)
            .GroupBy(tier => tier)
            .Select(g => new VerificationMethodCountDto(g.Key, g.Count()))
            .OrderByDescending(v => v.Count)
            .ToList();

        // ---- Who is on the platform -------------------------------------
        var roleRows = await _db.UserRoles.GroupBy(r => r.Role)
            .Select(g => new { g.Key, Count = g.Count() }).ToListAsync(ct);
        int Role(string r) => roleRows.FirstOrDefault(x => x.Key == r)?.Count ?? 0;
        var assigned = roleRows.Sum(x => x.Count);
        // Learners who created a profile before ever claiming a role still count
        // as people using the service, so they are shown rather than dropped.
        var unassigned = Math.Max(0, matriculants.Count - Role("student"));
        var roles = new RoleBreakdownDto(
            Role("student"), Role("mentor"), Role("professional"), Role("admin"), unassigned,
            assigned + unassigned);

        // ---- Growth ------------------------------------------------------
        var now = DateTime.UtcNow;
        var since30 = now.AddDays(-30);
        var recent = matriculants.Where(m => m.CreatedAt >= since30).ToList();
        var daily = recent
            .GroupBy(m => DateOnly.FromDateTime(m.CreatedAt))
            .Select(g => new DailyCountDto(g.Key, g.Count()))
            .OrderBy(d => d.Day)
            .ToList();
        var growth = new GrowthDto(
            matriculants.Count(m => m.CreatedAt >= now.AddDays(-7)),
            recent.Count,
            Math.Round(recent.Count / 30.0, 2),
            daily);

        // ---- Mentor pipeline ---------------------------------------------
        var apps = await _db.MentorApplications
            .Select(a => new { a.Status, a.SubmittedAt, a.DecidedAt })
            .ToListAsync(ct);
        var pendingApps = apps.Where(a => a.Status == "pending").ToList();
        var decided = apps.Where(a => a.DecidedAt != null)
            .Select(a => (a.DecidedAt!.Value - a.SubmittedAt).TotalDays)
            .OrderBy(d => d).ToList();

        var pipeline = new MentorPipelineDto(
            Pending: pendingApps.Count,
            Approved: apps.Count(a => a.Status == "approved"),
            Declined: apps.Count(a => a.Status == "rejected"),
            ActiveMentors: approvedMentors,
            // The oldest waiting application is the number that matters: one
            // sitting for weeks is a learner not being reached.
            OldestPendingDays: pendingApps.Count == 0 ? null
                : (int)Math.Floor((now - pendingApps.Min(a => a.SubmittedAt)).TotalDays),
            MedianDaysToDecision: decided.Count == 0 ? null
                : Math.Round(decided[decided.Count / 2], 1),
            PendingEvents: await _db.MentorEvents.CountAsync(e => e.Status == "pending", ct),
            ApprovedEvents: await _db.MentorEvents.CountAsync(e => e.Status == "approved", ct),
            UpcomingEvents: await _db.MentorEvents.CountAsync(
                e => e.Status == "approved" && e.StartsAt >= now, ct));

        // ---- Reach: what learners actually sign up on --------------------
        List<LabelCountDto> Mix(Func<Models.Matriculant, string?> pick) => matriculants
            .GroupBy(m => string.IsNullOrWhiteSpace(pick(m)) ? "unknown" : pick(m)!)
            .Select(g => new LabelCountDto(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .ToList();

        var deviceMix = Mix(m => m.SignupDeviceType);
        var platformMix = Mix(m => m.SignupPlatform);
        var gradeMix = matriculants
            .GroupBy(m => m.Grade is null ? "Not given" : $"Grade {m.Grade}")
            .Select(g => new LabelCountDto(g.Key, g.Count()))
            .OrderBy(x => x.Label)
            .ToList();

        return Ok(new AdminAnalyticsResponse(
            TotalMatriculants: matriculants.Count,
            MatriculantsByProvince: byProvince,
            AverageAps: avgAps,
            PendingApplications: pendingApplications,
            ApprovedMentors: approvedMentors,
            RejectedApplications: rejectedApplications,
            PendingHelpRequests: pendingRequests,
            AcceptedHelpRequests: acceptedRequests,
            DeclinedHelpRequests: declinedRequests,
            RecommendationLettersIssued: lettersIssued,
            VerificationMix: verificationMix,
            Roles: roles,
            Growth: growth,
            Pipeline: pipeline,
            DeviceMix: deviceMix,
            PlatformMix: platformMix,
            GradeMix: gradeMix
        ));
    }
}
