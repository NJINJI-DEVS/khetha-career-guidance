using CareerAdvisor.Api.DTOs;

namespace CareerAdvisor.Api.Services;

/// <summary>
/// Faithful C# port of frontend/src/engines/smsSummary.js's buildSmsSummary —
/// pure text formatting, same line order and wording, same top-N slicing
/// (3 matched qualifications, 2 saved favourites).
/// </summary>
public interface ISmsSummaryService
{
    string Build(SmsSummaryRequest req);
}

public class SmsSummaryService : ISmsSummaryService
{
    public string Build(SmsSummaryRequest req)
    {
        var first = (req.Learner.Name ?? "").Split(' ')[0];
        var lines = new List<string>();

        lines.Add($"KHETHA PLAN — {first}, Gr{req.Learner.Grade}");
        if (req.Learner.Grade >= 10) lines.Add($"APS {req.Aps}");

        if (req.Profile.CareerChoice is { } cc)
        {
            var code = string.Concat(cc.Code);
            var top = string.Join(", ", cc.Matches.Take(2).Select(m => m.Title));
            lines.Add($"Interests {code}: {top}");
        }
        if (req.Profile.JobFit is { Matches.Count: > 0 } jf)
        {
            var best = jf.Matches[0];
            lines.Add($"Best fit: {best.Title} {best.Fit}%");
        }
        if (req.Packages is { Count: > 0 })
        {
            var subjects = string.Join(", ", req.Packages[0].Subjects.Select(s => s.Split(' ')[0]));
            lines.Add($"Gr10 subjects: {subjects}");
        }

        if (req.Matched.Count > 0)
        {
            lines.Add("YOU QUALIFY FOR:");
            var i = 1;
            foreach (var m in req.Matched.Take(3))
            {
                var providerShort = string.Join(" ", m.ProviderName.Split(' ').Take(3));
                lines.Add($"{i}. {m.Title} - {providerShort} (APS{m.MinAps}, close {m.Deadline})");
                i++;
            }
        }
        else
        {
            lines.Add("No course matches yet - see a Khetha advisor");
        }

        var saved = req.Profile.Favourites.Take(2).ToList();
        if (saved.Count > 0)
        {
            lines.Add($"Saved: {string.Join("; ", saved.Select(s => $"{s.Title} (close {s.Deadline})"))}");
        }

        lines.Add("NSFAS: apply nsfas.org.za Sep-Jan, household under R350k");
        lines.Add("Help: Khetha 086 999 0123");

        return string.Join("\n", lines);
    }
}
