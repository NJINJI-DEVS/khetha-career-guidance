using System.Text.RegularExpressions;

namespace CareerAdvisor.Api.Services;

public record RedactionResult(string Text, string[] Found);

/// <summary>
/// Faithful C# port of frontend/src/engines/redact.js + data/redaction.js. Runs
/// server-side on every message send — this is the actual enforcement point (see
/// PROJECT-CONTEXT.md: client-side-only redaction can be bypassed by a modified
/// client, so this must happen here, not just in the UI).
///
/// The five rules are applied SEQUENTIALLY, each on the PREVIOUS rule's output —
/// not five independent regexes unioned against the original string. An email is
/// redacted before the handle rule runs, so a leftover "@" inside an
/// already-redacted "[removed]" can't double-match. Character classes are kept
/// ASCII-explicit ([0-9], not \d) since .NET's \d/\w match full Unicode categories
/// by default, unlike JavaScript's.
/// </summary>
public interface IRedactionService
{
    RedactionResult Redact(string text);
}

public class RedactionService : IRedactionService
{
    private static readonly (Regex Re, string Label)[] Rules =
    {
        (new Regex(@"(\+?27|0)\s?([0-9][\s-]?){8,11}[0-9]", RegexOptions.Compiled), "phone number"),
        (new Regex(@"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_.]+", RegexOptions.Compiled), "email address"),
        (new Regex(@"\b(?:https?://|www\.)\S+", RegexOptions.Compiled | RegexOptions.IgnoreCase), "link"),
        (new Regex(@"@[A-Za-z0-9._]{3,}", RegexOptions.Compiled), "social handle"),
        (new Regex(@"\b(whatsapp|instagram|tiktok|snapchat|telegram)\b", RegexOptions.Compiled | RegexOptions.IgnoreCase), "social platform"),
    };

    public RedactionResult Redact(string text)
    {
        var output = text;
        var found = new List<string>();

        foreach (var (re, label) in Rules)
        {
            if (re.IsMatch(output))
            {
                found.Add(label);
                output = re.Replace(output, "[removed]");
            }
        }

        return new RedactionResult(output, found.Distinct().ToArray());
    }
}
