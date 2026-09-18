using HtmlAgilityPack;

namespace CareerAdvisor.Api.Services;

public record ScrapedCourseEntry(string CourseName, string UniversityName, int MinimumAps, string RawHtmlSnippet);

/// <summary>
/// Scaffold for pulling published admission-requirement pages from official
/// government/university portals (e.g. Central Applications Office, individual
/// university prospectus pages, careershelp.gov.za, etc.).
///
/// READ BEFORE WIRING THIS UP:
///  - Every target site has its own HTML structure, so each needs its own parser method
///    below (one per source) — there is no universal "government portal" format.
///  - Check and respect each site's robots.txt and Terms of Use before scraping; some
///    government/CAO data is only available via a request for a data-sharing agreement,
///    which is the more robust and durable integration than scraping.
///  - Treat scraped output as untrusted, frequently-changing HTML: parse defensively,
///    log failures, and have a human spot-check new entries before they go live, since a
///    silent layout change on the source site can otherwise corrupt admission data.
///  - Run this on a schedule (nightly/weekly), never inline on a user's request.
/// </summary>
public interface IGovernmentPortalScraperService
{
    Task<List<ScrapedCourseEntry>> ScrapeAsync(string sourceUrl, CancellationToken ct = default);
}

public class GovernmentPortalScraperService : IGovernmentPortalScraperService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GovernmentPortalScraperService> _logger;

    public GovernmentPortalScraperService(HttpClient httpClient, ILogger<GovernmentPortalScraperService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<List<ScrapedCourseEntry>> ScrapeAsync(string sourceUrl, CancellationToken ct = default)
    {
        var results = new List<ScrapedCourseEntry>();
        try
        {
            var html = await _httpClient.GetStringAsync(sourceUrl, ct);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // EXAMPLE parser only — replace the XPath below with the actual structure
            // of the source page once you've confirmed it's permitted to scrape.
            var rows = doc.DocumentNode.SelectNodes("//table[contains(@class,'admissions')]//tr");
            if (rows is null)
            {
                _logger.LogWarning("No admissions table found at {Url} — page structure may have changed", sourceUrl);
                return results;
            }

            foreach (var row in rows.Skip(1)) // skip header
            {
                var cells = row.SelectNodes("td");
                if (cells is null || cells.Count < 3) continue;

                var courseName = cells[0].InnerText.Trim();
                var universityName = cells[1].InnerText.Trim();
                if (!int.TryParse(cells[2].InnerText.Trim(), out var aps)) continue;

                results.Add(new ScrapedCourseEntry(courseName, universityName, aps, row.OuterHtml));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to scrape {Url}", sourceUrl);
        }

        return results;
    }
}
