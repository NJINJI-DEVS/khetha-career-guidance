using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Services;

/// <summary>
/// Seeds the "certifications that don't require matric" list shown at the
/// bottom of the careers directory.
///
/// WHY HAND-COMPILED AND NOT SCRAPED LIVE: none of PSIRA, the ICB, the SETAs
/// or the Dept. of Employment &amp; Labour publish a machine-readable feed of
/// this information, and scraping their marketing pages live would silently
/// break the moment any of them redesigns a page. Each entry below was
/// confirmed against that body's own site at the time it was written (see
/// SourceUrl on each row) — the same "real source, not invented" discipline
/// as OfoCode.Source. Re-run the seed (admin-only) after checking the sources
/// again if requirements change; there is no automatic re-sync.
/// </summary>
public interface INoMatricCertificationSeedService
{
    Task<int> SeedAsync(CancellationToken ct = default);
}

public class NoMatricCertificationSeedService : INoMatricCertificationSeedService
{
    private readonly AppDbContext _db;
    public NoMatricCertificationSeedService(AppDbContext db) => _db = db;

    private static readonly List<NoMatricCertification> Entries = new()
    {
        new NoMatricCertification
        {
            Title = "National Certificate (Vocational): Engineering & Related Design",
            Category = "TVET / NCV",
            MinRequirement = "Grade 9",
            NqfLevel = 2,
            DurationLabel = "3 years (NQF 2 to 4)",
            Summary = "A 3-year TVET college programme mixing engineering theory with hands-on workshop practice — 40% classroom, 60% practical. Entry is a Grade 9 pass, an ABET Level 4 certificate, or an NQF Level 1 qualification; a matric is not required to start.",
            ProviderName = "Public TVET colleges (DHET)",
            ProviderWebsite = "tnc.edu.za",
            SourceUrl = "https://www.coursematch.co.za/blog/ncv-courses-requirements-for-tvet-colleges-in-south-africa",
            SortOrder = 1,
        },
        new NoMatricCertification
        {
            Title = "National Certificate (Vocational): Office Administration",
            Category = "TVET / NCV",
            MinRequirement = "Grade 9",
            NqfLevel = 2,
            DurationLabel = "3 years (NQF 2 to 4)",
            Summary = "Same NCV structure as the engineering stream, but for office, records and administrative work — bookkeeping basics, business practice and computer literacy included. Grade 9 is the entry requirement, not matric.",
            ProviderName = "Public TVET colleges (DHET)",
            ProviderWebsite = "swgc.co.za",
            SourceUrl = "https://www.coursematch.co.za/blog/ncv-courses-requirements-for-tvet-colleges-in-south-africa",
            SortOrder = 2,
        },
        new NoMatricCertification
        {
            Title = "Artisan Trade Test (Red Seal) — e.g. electrician, plumber, fitter, welder",
            Category = "Artisan trade",
            MinRequirement = "Grade 9 + 4 years relevant work experience (or N6/National Technical Diploma + 18 months experience)",
            NqfLevel = null,
            DurationLabel = "Varies by trade and route",
            Summary = "A recognised trade qualification proving competence in a specific trade. There are two routes in: a Grade 9 pass plus several years of hands-on experience, or a technical diploma with a shorter experience requirement — a full matric is not the gatekeeper here, verified experience is.",
            ProviderName = "Department of Employment & Labour / accredited trade test centres",
            ProviderWebsite = "www.labour.gov.za",
            SourceUrl = "https://artisantraining.co.za/ati-advanced-faq/what-are-the-requirements-for-writing-the-trade-test/",
            SortOrder = 3,
        },
        new NoMatricCertification
        {
            Title = "SETA Learnership (entry-level, NQF 2-3)",
            Category = "SETA learnership",
            MinRequirement = "Grade 9, 10 or 11 depending on the specific learnership",
            NqfLevel = 3,
            DurationLabel = "12 months (typical)",
            Summary = "A structured mix of paid workplace experience and formal training, run through one of South Africa's 21 SETAs (e.g. merSETA for manufacturing/engineering, Services SETA, W&RSETA for retail). Many entry-level learnerships accept Grade 9-11; higher NQF levels within the same SETA may later require matric to progress further.",
            ProviderName = "Sector Education and Training Authorities (SETAs)",
            ProviderWebsite = "www.serviceseta.org.za",
            SourceUrl = "https://www.setacareers.co.za/do-you-need-matric-for-seta-learnerships-complete-south-african-guide/",
            SortOrder = 4,
        },
        new NoMatricCertification
        {
            Title = "Security Officer Grading — Grade E (entry level)",
            Category = "Security (PSIRA)",
            MinRequirement = "Grade 10",
            NqfLevel = null,
            DurationLabel = "Days to a few weeks",
            Summary = "The starting grade for a registered security officer, regulated by PSIRA. Grade E only needs a Grade 10 pass; matric is only required to progress to the higher, supervisory grades (A and B).",
            ProviderName = "Private Security Industry Regulatory Authority (PSIRA)",
            ProviderWebsite = "www.psira.co.za",
            SourceUrl = "https://shiftmate.co.za/resources/blog/security-guard-jobs-south-africa-2026-psira-grades-salary",
            SortOrder = 5,
        },
        new NoMatricCertification
        {
            Title = "National Certificate: Bookkeeping (ICB)",
            Category = "Bookkeeping",
            MinRequirement = "Grade 10 (16 years or older)",
            NqfLevel = 3,
            DurationLabel = "6-12 months per level",
            Summary = "A nationally recognised, industry-respected bookkeeping qualification offered without a matric requirement — the Institute of Certified Bookkeepers only requires a completed Grade 10. It's a genuine route into a finance-admin career for someone who left school before matric.",
            ProviderName = "Institute of Certified Bookkeepers (ICB)",
            ProviderWebsite = "www.icb.org.za",
            SourceUrl = "https://support.icb.org.za/support/solutions/articles/9000178688-what-are-the-entry-requirements-",
            SortOrder = 6,
        },
        new NoMatricCertification
        {
            Title = "First Aid Level 1",
            Category = "First aid",
            MinRequirement = "No formal schooling requirement",
            NqfLevel = null,
            DurationLabel = "1-3 days",
            Summary = "An open-entry, short practical certification in emergency first aid — no matric, and no prior qualification, needed to enrol. Useful on its own for many entry-level jobs (childcare, hospitality, security, sports coaching), and often a first step toward further health-sector training.",
            ProviderName = "St John Ambulance South Africa / South African Red Cross Society",
            ProviderWebsite = "www.stjohn.org.za",
            SourceUrl = "https://www.stjohn.org.za",
            SortOrder = 7,
        },
    };

    public async Task<int> SeedAsync(CancellationToken ct = default)
    {
        var existingTitles = await _db.NoMatricCertifications.Select(c => c.Title).ToListAsync(ct);
        var toAdd = Entries.Where(e => !existingTitles.Contains(e.Title)).ToList();
        foreach (var e in toAdd) e.LastVerifiedAt = DateTime.UtcNow;

        _db.NoMatricCertifications.AddRange(toAdd);
        await _db.SaveChangesAsync(ct);
        return toAdd.Count;
    }
}
