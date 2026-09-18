using System.Net;
using System.Text;
using System.Text.Json;
using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CareerAdvisor.Api.Services;

/// <summary>
/// Turns an imported OFO row into something a school leaver can use.
///
/// WHY THIS EXISTS: the published OFO gives a code, a title, a group and a
/// formal description written for labour-market statisticians. It gives no
/// RIASEC codes, no work-context vector, no school subjects, no salary and no
/// plain-language summary — and this app's Career Choice and Job Fit engines
/// match on exactly those. Without enrichment, importing real OFO data would
/// produce a directory that breaks both engines and tells a learner nothing.
///
/// PROVENANCE: everything this service writes is AI-generated and is recorded
/// as such on the row (Source, EnrichmentModel, EnrichedAt). The authoritative
/// fields — code, title, group, official description — are never overwritten
/// here. The build checklist asks which data is official and which is not; this
/// split is how that question gets an honest answer.
///
/// KEY-READY: with no Gemini:ApiKey configured, IsConfigured is false and
/// EnrichAsync is a no-op that says so. Nothing else in the app depends on it.
/// </summary>
public interface IOccupationEnrichmentService
{
    bool IsConfigured { get; }
    Task<EnrichmentResult> EnrichAsync(int batchSize, CancellationToken ct = default);
}

public record EnrichmentResult(bool Configured, int Attempted, int Enriched, int Failed, List<string> Notes);

public class OccupationEnrichmentService : IOccupationEnrichmentService
{
    private readonly AppDbContext _db;
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<OccupationEnrichmentService> _logger;

    public OccupationEnrichmentService(
        AppDbContext db, HttpClient http, IConfiguration config, ILogger<OccupationEnrichmentService> logger)
    {
        _db = db; _http = http; _config = config; _logger = logger;
    }

    private string? ApiKey => _config["Gemini:ApiKey"];
    /* Default chosen from live behaviour, not from the docs:
         gemini-2.0-flash  404, retired
         gemini-3.6-flash  503 on every attempt across two sessions, even with
                           backoff — the API recommends it, but it is saturated
         gemini-2.5-flash  works, and enriched 12/12 occupations first time
       Newer is not better if it never answers. Still configurable, because this
       will age: list live models with GET /v1beta/models before changing it. */
    private string Model => _config["Gemini:Model"] ?? "gemini-2.5-flash";
    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);

    // The engines and the UI only understand these values, so the model's output
    // is validated against them rather than trusted. An invented field key or a
    // seventh Holland letter would silently break matching.
    private static readonly string[] Fields = { "stem", "health", "business", "trades", "social", "creative" };
    private static readonly string[] Riasec = { "R", "I", "A", "S", "E", "C" };
    private static readonly string[] Subjects =
    {
        "maths", "mathslit", "english", "physci", "lifesci", "accounting", "business", "economics",
        "geography", "history", "it", "cat", "egd", "technical", "art", "agric", "tourism", "consumer", "lo",
    };

    public async Task<EnrichmentResult> EnrichAsync(int batchSize, CancellationToken ct = default)
    {
        var notes = new List<string>();

        if (!IsConfigured)
        {
            notes.Add("Gemini:ApiKey is not configured, so no enrichment ran. Imported occupations stay unpublished until it is set.");
            return new EnrichmentResult(false, 0, 0, 0, notes);
        }

        var pending = await _db.OfoCodes
            .Where(o => o.EnrichedAt == null)
            .OrderBy(o => o.Code)
            .Take(Math.Clamp(batchSize, 1, 50))     // one prompt per batch; 50 keeps the response parseable
            .ToListAsync(ct);

        if (pending.Count == 0)
        {
            notes.Add("Nothing pending — every imported occupation already has enrichment.");
            return new EnrichmentResult(true, 0, 0, 0, notes);
        }

        var enriched = 0;
        var failed = 0;

        try
        {
            var generated = await CallGeminiAsync(pending, ct);

            foreach (var row in pending)
            {
                if (!generated.TryGetValue(row.Code, out var g))
                {
                    failed++;
                    continue;
                }

                row.Summary = Trim(g.Summary, 400);
                row.Tasks = (g.Tasks ?? new()).Where(t => !string.IsNullOrWhiteSpace(t)).Take(5).Select(t => Trim(t, 200)!).ToList();
                row.Riasec = (g.Riasec ?? new()).Select(r => r.Trim().ToUpperInvariant())
                                                .Where(r => Riasec.Contains(r)).Distinct().Take(3).ToList();
                row.Subjects = (g.Subjects ?? new()).Select(s => s.Trim().ToLowerInvariant())
                                                    .Where(s => Subjects.Contains(s)).Distinct().Take(6).ToList();
                row.FieldKey = Fields.Contains(g.Field?.Trim().ToLowerInvariant() ?? "") ? g.Field!.Trim().ToLowerInvariant() : "stem";
                row.Demand = Trim(g.Demand, 60);
                row.SalaryRange = Trim(g.SalaryRange, 80);
                row.SalaryMin = g.SalaryMin is > 0 ? g.SalaryMin : null;
                row.SalaryMax = g.SalaryMax is > 0 ? g.SalaryMax : null;
                row.ContextPeople = Clamp(g.ContextPeople);
                row.ContextData = Clamp(g.ContextData);
                row.ContextThings = Clamp(g.ContextThings);
                row.ContextOutdoors = Clamp(g.ContextOutdoors);
                row.ContextRoutine = Clamp(g.ContextRoutine);
                row.EnrichmentModel = Model;
                row.EnrichedAt = DateTime.UtcNow;

                // An occupation with no RIASEC and no subjects is useless to the
                // engines and to the learner, so it stays unpublished rather than
                // appearing as an empty card.
                row.IsPublished = row.Riasec.Count > 0 && row.Subjects.Count > 0 && !string.IsNullOrWhiteSpace(row.Summary);
                if (!row.IsPublished) notes.Add($"{row.Code}: enrichment incomplete, left unpublished.");

                enriched++;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini enrichment batch failed");
            notes.Add($"Batch failed: {ex.Message}");
            failed = pending.Count;
        }

        _db.DataSyncLogs.Add(new DataSyncLog
        {
            SourceName = $"Gemini enrichment ({Model})",
            Success = failed == 0,
            RecordsProcessed = enriched,
            Notes = notes.Count > 0 ? string.Join(" | ", notes.Take(20)) : null,
        });
        await _db.SaveChangesAsync(ct);

        return new EnrichmentResult(true, pending.Count, enriched, failed, notes);
    }

    private static int Clamp(int? v) => Math.Clamp(v ?? 0, 0, 4);
    private static string? Trim(string? s, int max) =>
        string.IsNullOrWhiteSpace(s) ? null : s.Length <= max ? s.Trim() : s[..max].Trim();

    private record Generated(
        string Code, string? Summary, List<string>? Tasks, List<string>? Riasec, List<string>? Subjects,
        string? Field, string? Demand, string? SalaryRange, int? SalaryMin, int? SalaryMax,
        int? ContextPeople, int? ContextData, int? ContextThings, int? ContextOutdoors, int? ContextRoutine);

    private async Task<Dictionary<string, Generated>> CallGeminiAsync(List<OfoCode> batch, CancellationToken ct)
    {
        var list = string.Join("\n", batch.Select(o => $"- {o.Code} | {o.Title} | {o.MajorGroup} | {Trim(o.Description, 300)}"));

        var prompt = $"""
            You are helping build the South African Department of Higher Education and Training's
            Khetha career guidance app, used by Grade 9 to 12 learners.

            For each OFO occupation below, produce learner-facing guidance for the South African
            context specifically — NSC subjects, South African salary bands in rand per month, and
            South African labour-market demand.

            Rules:
            - summary: ONE sentence, plain language, Grade 9 reading level. No jargon.
            - tasks: 3 concrete things the person actually does day to day.
            - riasec: 1 to 2 Holland codes, ONLY from R, I, A, S, E, C.
            - subjects: NSC subject keys needed or strongly advised, ONLY from this list:
              {string.Join(", ", Subjects)}
            - field: exactly one of: {string.Join(", ", Fields)}
            - demand: short phrase such as "Scarce skill", "High demand", "Steady", "Declining".
            - salaryRange: a readable South African monthly range, e.g. "R18 000 - R45 000 a month".
            - salaryMin / salaryMax: the same figures as plain monthly rand integers.
            - context*: integers 0 to 4 describing the work — people (dealing with people),
              data (analysis), things (hands-on), outdoors, routine (repetitive vs varied).
            - code: echo the OFO code back EXACTLY as given so rows can be matched.

            Be honest about salary: give realistic entry-to-experienced South African ranges, not
            aspirational figures. If an occupation is rare or you are unsure, still answer, but keep
            the range wide.

            Occupations:
            {list}
            """;

        var body = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new
            {
                temperature = 0.4,
                responseMimeType = "application/json",
                responseSchema = new
                {
                    type = "ARRAY",
                    items = new
                    {
                        type = "OBJECT",
                        required = new[] { "code", "summary", "tasks", "riasec", "subjects", "field" },
                        properties = new Dictionary<string, object>
                        {
                            ["code"] = new { type = "STRING" },
                            ["summary"] = new { type = "STRING" },
                            ["tasks"] = new { type = "ARRAY", items = new { type = "STRING" } },
                            ["riasec"] = new { type = "ARRAY", items = new { type = "STRING" } },
                            ["subjects"] = new { type = "ARRAY", items = new { type = "STRING" } },
                            ["field"] = new { type = "STRING" },
                            ["demand"] = new { type = "STRING" },
                            ["salaryRange"] = new { type = "STRING" },
                            ["salaryMin"] = new { type = "INTEGER" },
                            ["salaryMax"] = new { type = "INTEGER" },
                            ["contextPeople"] = new { type = "INTEGER" },
                            ["contextData"] = new { type = "INTEGER" },
                            ["contextThings"] = new { type = "INTEGER" },
                            ["contextOutdoors"] = new { type = "INTEGER" },
                            ["contextRoutine"] = new { type = "INTEGER" },
                        },
                    },
                },
            },
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Model}:generateContent?key={ApiKey}";
        var payload = JsonSerializer.Serialize(body);

        /* 503 "high demand" and 429 are common enough on the flash models that a
           single attempt regularly loses a whole batch. Both are transient and
           neither is billed, so a short backoff is far cheaper than re-running
           the batch. Anything else — a bad key, a retired model name — fails
           immediately, because retrying it would only waste time. */
        string raw = "";
        HttpStatusCode status = 0;
        var delays = new[] { 2, 6, 15 };

        for (var attempt = 0; attempt <= delays.Length; attempt++)
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(payload, Encoding.UTF8, "application/json"),
            };
            using var res = await _http.SendAsync(req, ct);
            status = res.StatusCode;
            raw = await res.Content.ReadAsStringAsync(ct);

            if (res.IsSuccessStatusCode) break;

            var transient = status is HttpStatusCode.ServiceUnavailable or HttpStatusCode.TooManyRequests
                            or HttpStatusCode.InternalServerError or HttpStatusCode.GatewayTimeout;
            if (!transient || attempt == delays.Length)
                throw new InvalidOperationException($"Gemini returned {(int)status}: {Trim(raw, 500)}");

            _logger.LogWarning("Gemini {Status}, retrying in {Delay}s (attempt {Attempt})",
                (int)status, delays[attempt], attempt + 1);
            await Task.Delay(TimeSpan.FromSeconds(delays[attempt]), ct);
        }

        using var doc = JsonDocument.Parse(raw);
        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "[]";

        var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var generated = JsonSerializer.Deserialize<List<Generated>>(text, opts) ?? new();

        return generated
            .Where(g => !string.IsNullOrWhiteSpace(g.Code))
            .GroupBy(g => g.Code.Trim())
            .ToDictionary(g => g.Key, g => g.First());
    }
}
