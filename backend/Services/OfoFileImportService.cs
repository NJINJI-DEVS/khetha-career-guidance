using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;

namespace CareerAdvisor.Api.Services;

using CsvRow = Dictionary<string, string>;

/// <summary>
/// Reads the published OFO file into the row shape IOfoImportService already
/// accepts.
///
/// WHY A FILE AND NOT AN API: neither DHET nor SAQA publishes a REST API for
/// this data, and the NCAP portal (ncap.careerhelp.org.za) was returning HTTP
/// 500 at the time of writing. The OFO is distributed as a spreadsheet, so a
/// file import IS the official integration path, not a workaround. Export the
/// sheet to CSV and post it to /api/occupations/import.
///
/// Column names vary between OFO releases and between the Excel sheet and a
/// CSV export of it, so headers are matched loosely rather than exactly — an
/// import that fails because a column is called "OFO_Code" instead of
/// "OFO Code" is a support call nobody needs.
/// </summary>
public interface IOfoFileImportService
{
    Task<OfoFileParseResult> ParseAsync(Stream csv, CancellationToken ct = default);
}

public record OfoFileParseResult(List<CsvRow> Rows, List<string> Warnings, string[] DetectedHeaders);

public class OfoFileImportService : IOfoFileImportService
{
    private readonly ILogger<OfoFileImportService> _logger;
    public OfoFileImportService(ILogger<OfoFileImportService> logger) => _logger = logger;

    // Canonical name -> the header spellings seen across OFO releases and exports.
    private static readonly Dictionary<string, string[]> HeaderAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["OFO Code"]        = new[] { "ofo code", "ofo_code", "ofocode", "code", "occupation code" },
        ["Title"]           = new[] { "title", "occupation", "occupation title", "occupation name", "description of occupation" },
        ["Major Group"]     = new[] { "major group", "major_group", "majorgroup", "major group description" },
        ["Sub-Minor Group"] = new[] { "sub-minor group", "sub minor group", "subminor group", "sub_minor_group", "minor group", "unit group" },
        ["Description"]     = new[] { "description", "occupation description", "task description", "definition" },
    };

    private static string? Canonical(string header)
    {
        var h = header.Trim();
        foreach (var (canonical, aliases) in HeaderAliases)
            if (aliases.Contains(h, StringComparer.OrdinalIgnoreCase)) return canonical;
        return null;
    }

    public async Task<OfoFileParseResult> ParseAsync(Stream csv, CancellationToken ct = default)
    {
        var warnings = new List<string>();
        var rows = new List<CsvRow>();

        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            // A published government spreadsheet will have ragged rows, trailing
            // blank columns and stray notes. None of that should abort the import.
            MissingFieldFound = null,
            BadDataFound = null,
            HeaderValidated = null,
            TrimOptions = TrimOptions.Trim,
            IgnoreBlankLines = true,
            DetectDelimiter = true,
        };

        using var reader = new StreamReader(csv);
        using var parser = new CsvReader(reader, config);

        await parser.ReadAsync();
        parser.ReadHeader();
        var headers = parser.HeaderRecord ?? Array.Empty<string>();

        var map = new Dictionary<string, string>();   // canonical -> actual header
        foreach (var h in headers)
        {
            var c = Canonical(h);
            if (c is not null && !map.ContainsKey(c)) map[c] = h;
        }

        if (!map.ContainsKey("OFO Code"))
            throw new InvalidOperationException(
                $"No OFO code column found. Looked for {string.Join(", ", HeaderAliases["OFO Code"])}. " +
                $"File headers were: {string.Join(", ", headers)}");

        if (!map.ContainsKey("Title"))
            warnings.Add("No title column matched — occupations will import with an empty title.");

        var lineNumber = 1;
        while (await parser.ReadAsync())
        {
            ct.ThrowIfCancellationRequested();
            lineNumber++;

            var code = parser.GetField(map["OFO Code"])?.Trim();
            if (string.IsNullOrWhiteSpace(code))
            {
                warnings.Add($"Row {lineNumber}: no OFO code, skipped.");
                continue;
            }

            var row = new CsvRow { ["OFO Code"] = code };
            foreach (var (canonical, actual) in map)
            {
                if (canonical == "OFO Code") continue;
                row[canonical] = parser.GetField(actual)?.Trim() ?? string.Empty;
            }
            rows.Add(row);
        }

        // Duplicate codes in one file mean the later row silently wins on upsert.
        // Surfacing it is cheaper than someone wondering why a title is wrong.
        var dupes = rows.GroupBy(r => r["OFO Code"]).Where(g => g.Count() > 1).Select(g => g.Key).Take(10).ToList();
        if (dupes.Count > 0)
            warnings.Add($"Duplicate OFO codes in file (last one wins): {string.Join(", ", dupes)}");

        _logger.LogInformation("Parsed {Count} OFO rows with {Warnings} warnings", rows.Count, warnings.Count);
        return new OfoFileParseResult(rows, warnings, headers);
    }
}
