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
            VerificationMix: verificationMix
        ));
    }
}
