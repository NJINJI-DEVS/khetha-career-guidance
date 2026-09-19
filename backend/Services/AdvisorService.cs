using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CareerAdvisor.Api.Services;

/// <summary>
/// Real AI for the Advisor chat, not scripted keyword matching. The frontend
/// still tries its own instant, offline-safe SCRIPTS keyword match first
/// (see Advisor.jsx) for the handful of most common questions — this is only
/// called for anything that doesn't match one of those, and the frontend
/// falls back to a static message if this throws (missing API key, network
/// error, etc.), so a misconfigured or unreachable key degrades the app
/// gracefully rather than breaking it.
/// </summary>
public interface IAdvisorService
{
    Task<string> AskAsync(string message, string language, CancellationToken ct = default);
}

public class AdvisorService : IAdvisorService
{
    private readonly HttpClient _http;
    private readonly string? _apiKey;
    private static readonly Dictionary<string, string> LanguageNames = new()
    {
        ["en"] = "English", ["zu"] = "isiZulu", ["tn"] = "Setswana",
        ["af"] = "Afrikaans", ["xh"] = "isiXhosa", ["st"] = "Sesotho",
    };

    public AdvisorService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _http.BaseAddress = new Uri("https://api.anthropic.com/");
        _apiKey = config["Anthropic:ApiKey"];
    }

    public async Task<string> AskAsync(string message, string language, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            throw new InvalidOperationException("Anthropic:ApiKey is not configured.");

        var languageName = LanguageNames.GetValueOrDefault(language, "English");
        var systemPrompt =
            "You are Khetha, a career-guidance chat advisor inside a DHET (Department of Higher Education " +
            "and Training) mobile app for South African high school learners, built against the National " +
            "Career Advice Portal (NCAP). Answer ONLY questions about subject choice, APS/admission points, " +
            "career paths, qualifications, NSFAS/funding, TVET/university/UoT options, and applying to study " +
            "in South Africa. For anything outside that scope (or anything needing legal, medical, or urgent " +
            "safety advice), say briefly that it's outside what you can help with and point them to the " +
            "Advice directory in the app to reach a real Khetha career practitioner. " +
            "Keep answers short (2-4 sentences), concrete, and in a warm, direct, informal South African " +
            "youth register (e.g. 'chommie', 'sharp sharp', 'bafethu' where natural, not forced). Don't " +
            "invent specific institution names, fees, or admission numbers you aren't confident about — speak " +
            "in general terms instead and suggest they confirm on the institution's own site. " +
            $"Reply in {languageName}, the language this learner has the app set to.";

        var payload = new
        {
            model = "claude-haiku-4-5-20251001",
            max_tokens = 400,
            system = systemPrompt,
            messages = new[] { new { role = "user", content = message } },
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/messages")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"),
        };
        request.Headers.Add("x-api-key", _apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");

        var response = await _http.SendAsync(request, ct);
        var body = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Anthropic API error {(int)response.StatusCode}: {body}");

        var parsed = JsonSerializer.Deserialize<AnthropicResponse>(body)
            ?? throw new InvalidOperationException("Anthropic API returned an unparsable response.");
        var text = parsed.Content?.FirstOrDefault(c => c.Type == "text")?.Text;
        return string.IsNullOrWhiteSpace(text)
            ? throw new InvalidOperationException("Anthropic API returned no text content.")
            : text.Trim();
    }

    private record AnthropicResponse([property: JsonPropertyName("content")] List<AnthropicContentBlock>? Content);
    private record AnthropicContentBlock(
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("text")] string? Text);
}
