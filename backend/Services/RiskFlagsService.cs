using System.Text.RegularExpressions;
using CareerAdvisor.Api.Models;

namespace CareerAdvisor.Api.Services;

public record RiskFlagsResult(List<RiskFlag> Flags, int Score, string Verdict);

/// <summary>
/// Faithful C# port of frontend/src/engines/riskFlags.js — the mentor/professional
/// application safeguarding engine. Transcribed deliberately, not "cleaned up":
/// the email-domain-vs-institution heuristic keeps its exact (unfiltered acronym,
/// untrimmed split, bidirectional substring) matching logic, since tidying it
/// changes which real applications get flagged. Regexes use ASCII-explicit
/// character classes ([0-9]/[A-Za-z], not \d/\w) since .NET's \d/\w match full
/// Unicode categories by default, unlike JavaScript's.
/// </summary>
public interface IRiskFlagsService
{
    RiskFlagsResult Evaluate(MentorApplication app);
}

public class RiskFlagsService : IRiskFlagsService
{
    private readonly ISaIdService _saId;

    private static readonly Regex IdLikeFormat = new(@"^[A-Z0-9]{6,12}$", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex FreeEmail = new(@"@(gmail|yahoo|outlook|hotmail|live|icloud|webmail|aol)\.", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex InstitutionalDomain = new(@"\.(ac|edu|gov)\.za$|\.edu$", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex StartsWithDigit = new(@"^[0-9]", RegexOptions.Compiled);
    private static readonly Regex LinkedInProfile = new(@"linkedin\.com/in/", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex Whitespace = new(@"\s+", RegexOptions.Compiled);

    private static readonly Dictionary<string, (Regex Re, string Hint)> LicenceFormats = new()
    {
        ["sace"] = (new Regex(@"^[0-9]{8,10}$", RegexOptions.Compiled), "SACE numbers are 8 to 10 digits"),
        ["saica"] = (new Regex(@"^[0-9]{6,8}$", RegexOptions.Compiled), "SAICA numbers are 6 to 8 digits"),
        ["ecsa"] = (new Regex(@"^[0-9]{6,9}$", RegexOptions.Compiled), "ECSA numbers are 6 to 9 digits"),
        ["hpcsa"] = (new Regex(@"^[A-Z]{2}\s?[0-9]{6,7}$", RegexOptions.Compiled | RegexOptions.IgnoreCase), "HPCSA numbers start with two letters"),
    };

    public RiskFlagsService(ISaIdService saId) => _saId = saId;

    public RiskFlagsResult Evaluate(MentorApplication app)
    {
        var flags = new List<RiskFlag>();
        void Push(string level, string title, string detail) => flags.Add(new RiskFlag(level, title, detail));

        var email = (app.WorkEmail ?? "").Trim();
        var name = (app.FullName ?? "").Trim().ToLowerInvariant();
        var nameParts = Whitespace.Split(name);
        var surname = nameParts.Length > 0 ? nameParts[^1] : "";

        /* Identity */
        var id = _saId.Check(app.IdNumber);
        var idTrimmed = (app.IdNumber ?? "").Trim();
        if (!string.IsNullOrEmpty(app.IdNumber) && !id.Valid && !IdLikeFormat.IsMatch(idTrimmed))
        {
            Push("high", "ID number does not validate",
                $"The number {id.Reason}. A real SA ID passes a checksum — a fabricated one almost never does.");
        }
        if (id.Valid && id.Age is int age)
        {
            if (age < 18)
            {
                Push("high", "Applicant is under 18",
                    $"The ID gives an age of {age}. Under-18s cannot hold a mentor account that contacts other minors unsupervised.");
            }
            else if (age < 20 && app.Role != "mentor")
            {
                Push("medium", "Age sits oddly against the claim",
                    $"Age {age} against a claim of professional experience. Ask how long they have been working.");
            }
            if (age > 75)
            {
                Push("low", "Unusual age for the claimed role", $"Age {age}. Not disqualifying, but worth a question.");
            }
        }
        if (string.IsNullOrEmpty(app.IdDocumentFilename))
        {
            Push("high", "No ID document uploaded",
                "Everything about this identity is self-declared. There is nothing to check the typed details against.");
        }

        /* Email */
        if (string.IsNullOrEmpty(email))
        {
            Push("medium", "No work or academic email", "A free-standing claim of employment with no institutional address behind it.");
        }
        else if (FreeEmail.IsMatch(email))
        {
            Push("high", "Free email used as a work address", $"{email} is a personal provider. Anyone can create one in a minute under any name.");
        }
        else
        {
            var atParts = email.Split('@');
            var domain = atParts.Length > 1 ? atParts[1] : "";
            var institutional = InstitutionalDomain.IsMatch(domain);
            var claimed = (app.Institution ?? "").ToLowerInvariant();
            var domainRoot = domain.Split('.')[0];

            if (!institutional && !string.IsNullOrEmpty(claimed) && !string.IsNullOrEmpty(domainRoot))
            {
                var allWords = Whitespace.Split(claimed);
                var words = allWords.Where(w => w.Length > 3).ToArray();
                var acronym = string.Concat(allWords.Select(w => w.Length > 0 ? w[0].ToString() : ""));

                bool WordMatches(string w)
                {
                    var wPrefix = w.Length >= 4 ? w[..4] : w;
                    return domainRoot.Contains(wPrefix) || w.Contains(domainRoot);
                }

                var matches = words.Any(WordMatches) || acronym.Contains(domainRoot) || domainRoot.Contains(acronym);
                if (!matches)
                {
                    Push("medium", "Email domain does not match the stated employer",
                        $"They claim {app.Institution} but write from {domain}, which is not an institutional address.");
                }
            }

            var local = (atParts.Length > 0 ? atParts[0] : "").ToLowerInvariant();
            var surnamePrefix = surname.Length >= 4 ? surname[..4] : surname;
            if (!institutional && surname.Length > 3 && !local.Contains(surnamePrefix) && !StartsWithDigit.IsMatch(local))
            {
                Push("low", "Email does not carry the applicant's surname",
                    $"{local}@ against the surname \"{surname}\". Common with shared addresses, but also with borrowed ones.");
            }
        }

        /* Credentials */
        if (!string.IsNullOrEmpty(app.LicenceBody) && app.LicenceBody != "none")
        {
            var hasFormat = LicenceFormats.TryGetValue(app.LicenceBody, out var fmt);
            var num = (app.LicenceNumber ?? "").Trim();
            if (string.IsNullOrEmpty(num))
            {
                Push("high", "Registration body claimed with no number", $"They selected {app.LicenceBody.ToUpperInvariant()} but supplied nothing to check.");
            }
            else if (hasFormat && !fmt.Re.IsMatch(num))
            {
                Push("high", "Registration number is the wrong shape", $"{fmt.Hint}. \"{num}\" does not match, so it cannot be looked up on the council register.");
            }
            else
            {
                Push("low", "Registration number needs a register check", $"Format is right. Confirm {num} on the {app.LicenceBody.ToUpperInvariant()} register before approving.");
            }
        }
        else if (app.ClaimsTeacher)
        {
            Push("high", "Claims to teach with no SACE registration", "Every practising educator in South Africa must be SACE registered. Its absence is the single loudest signal here.");
        }

        if (string.IsNullOrEmpty(app.TranscriptFilename) && string.IsNullOrEmpty(app.LicenceNumber))
        {
            Push("medium", "No qualification evidence at all", "No transcript, no certificate, no registration number. The stated qualification rests entirely on their word.");
        }

        if (!string.IsNullOrEmpty(app.PartnerCode) && string.IsNullOrEmpty(app.PartnerName))
        {
            Push("high", "Partner access code is not recognised", $"\"{app.PartnerCode}\" is not on the issued list. Either mistyped, expired, or invented.");
        }

        /* Behavioural */
        if (!string.IsNullOrEmpty(app.LinkedIn) && !LinkedInProfile.IsMatch(app.LinkedIn))
        {
            Push("low", "LinkedIn link is not a profile URL", "Points somewhere other than a personal profile page.");
        }
        if (string.IsNullOrEmpty(app.LinkedIn) && app.Role == "professional")
        {
            Push("low", "No LinkedIn profile", "Most working professionals have one. Its absence is weak on its own.");
        }
        if (app.SubmitSeconds < 45)
        {
            Push("medium", "Application completed unusually fast",
                $"Submitted in {app.SubmitSeconds} seconds. Genuine applicants stop to find documents; prepared fakes paste from a script.");
        }
        if (!string.IsNullOrEmpty(app.DuplicateOf))
        {
            Push("high", "Matches an existing account", $"The same ID or email is already on file as {app.DuplicateOf}. Duplicate accounts are how a rejected applicant returns.");
        }
        if (!string.IsNullOrEmpty(app.SubjectMismatch))
        {
            Push("medium", "Offers subjects outside their stated field", $"Qualified in {app.Field}, offering {app.SubjectMismatch}. Ask what qualifies them for it.");
        }

        var score = flags.Sum(f => f.Level switch { "high" => 3, "medium" => 1, _ => 0 });
        var verdict = score >= 6 ? "high" : score >= 3 ? "medium" : flags.Count > 0 ? "low" : "clear";

        return new RiskFlagsResult(flags, score, verdict);
    }
}
