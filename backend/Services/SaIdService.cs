using System.Text.RegularExpressions;

namespace CareerAdvisor.Api.Services;

public record SaIdCheckResult(bool Valid, string? Reason, int? Age, string? Citizen);

/// <summary>
/// Faithful C# port of frontend/src/engines/saId.js (South African ID number
/// validation). Deliberately replicates that file's loose heuristics exactly,
/// including ones that look like bugs — the century disambiguation and age
/// calculation ignore month/day, and the date check never validates days-in-month.
/// These are existing accepted behavior on the frontend, not defects to fix here;
/// diverging from them would silently produce different risk verdicts than the
/// same input gets today.
/// </summary>
public interface ISaIdService
{
    SaIdCheckResult Check(string? raw);
}

public class SaIdService : ISaIdService
{
    private static readonly Regex Whitespace = new(@"\s", RegexOptions.Compiled);
    private static readonly Regex ThirteenDigits = new(@"^[0-9]{13}$", RegexOptions.Compiled);

    public SaIdCheckResult Check(string? raw)
    {
        var id = Whitespace.Replace(raw ?? "", "");
        if (!ThirteenDigits.IsMatch(id))
            return new SaIdCheckResult(false, "not 13 digits", null, null);

        var yy = int.Parse(id[..2]);
        var mm = int.Parse(id.Substring(2, 2));
        var dd = int.Parse(id.Substring(4, 2));
        if (mm < 1 || mm > 12 || dd < 1 || dd > 31)
            return new SaIdCheckResult(false, "impossible date of birth", null, null);

        // Luhn checksum, as used by Home Affairs — right-to-left, alt starts false
        // on the rightmost (checksum) digit itself.
        var sum = 0;
        var alt = false;
        for (var i = id.Length - 1; i >= 0; i--)
        {
            var n = id[i] - '0';
            if (alt)
            {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alt = !alt;
        }
        if (sum % 10 != 0)
            return new SaIdCheckResult(false, "checksum fails", null, null);

        var citizen = id[10] - '0';
        if (citizen > 1)
            return new SaIdCheckResult(false, "invalid citizenship digit", null, null);

        var nowYY = DateTime.UtcNow.Year % 100;
        var century = yy <= nowYY ? 2000 : 1900;
        var age = DateTime.UtcNow.Year - (century + yy);

        return new SaIdCheckResult(true, null, age, citizen == 0 ? "SA citizen" : "permanent resident");
    }
}
