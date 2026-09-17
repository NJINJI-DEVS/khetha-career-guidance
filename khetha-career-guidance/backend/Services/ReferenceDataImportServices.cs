using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using CsvRow = System.Collections.Generic.Dictionary<string, string>;

namespace CareerAdvisor.Api.Services;

/// <summary>
/// Imports OFO (Organising Framework for Occupations) codes.
///
/// IMPORTANT: The Dept. of Employment & Labour / DHET publish the OFO list as a
/// downloadable spreadsheet (updated periodically, not a live REST API). There is no
/// public "OFO API" to call at request time. The correct integration pattern is:
///   1. Download the current OFO spreadsheet release (.xlsx/.csv) from the department's
///      site (check for the latest link each release cycle — URLs change per version).
///   2. Run this importer as a scheduled job (e.g. nightly/weekly Hangfire/cron job)
///      to upsert rows into the ofo_codes table.
///   3. Application code (CourseMatchingService, controllers) then reads from the
///      local ofo_codes table — fast, reliable, no external dependency per request.
/// This class expects rows already parsed from that spreadsheet (see ImportFromRowsAsync);
/// plug in a CSV/Excel reader (e.g. ClosedXML) in Program.cs to feed it.
/// </summary>
public interface IOfoImportService
{
    Task<int> ImportFromRowsAsync(IEnumerable<CsvRow> rows, CancellationToken ct = default);
}

public class OfoImportService : IOfoImportService
{
    private readonly AppDbContext _db;
    public OfoImportService(AppDbContext db) => _db = db;

    public async Task<int> ImportFromRowsAsync(IEnumerable<CsvRow> rows, CancellationToken ct = default)
    {
        int count = 0;
        foreach (var row in rows)
        {
            var code = row.GetValueOrDefault("OFO Code") ?? row.GetValueOrDefault("code") ?? "";
            if (string.IsNullOrWhiteSpace(code)) continue;

            var existing = _db.OfoCodes.FirstOrDefault(o => o.Code == code);
            if (existing is null)
            {
                existing = new OfoCode { Code = code };
                _db.OfoCodes.Add(existing);
            }

            existing.Title = row.GetValueOrDefault("Title") ?? existing.Title;
            existing.MajorGroup = row.GetValueOrDefault("Major Group") ?? existing.MajorGroup;
            existing.SubMinorGroup = row.GetValueOrDefault("Sub-Minor Group") ?? existing.SubMinorGroup;
            existing.Description = row.GetValueOrDefault("Description") ?? existing.Description;
            existing.LastSyncedAt = DateTime.UtcNow;
            count++;
        }

        _db.DataSyncLogs.Add(new DataSyncLog { SourceName = "OFO", Success = true, RecordsProcessed = count });
        await _db.SaveChangesAsync(ct);
        return count;
    }
}

/// <summary>
/// Imports SAQA (South African Qualifications Authority) qualification records.
///
/// IMPORTANT: SAQA's National Learners' Records Database (NLRD) is not a public,
/// self-serve REST API either. Bulk/registered access to the qualifications register
/// typically requires an MIS data-sharing agreement with SAQA, or manual export from
/// the public qualifications search on saqa.org.za. As with OFO, this service is a
/// batch importer intended to run on a schedule against whatever export format you
/// obtain, not a per-request HTTP client.
/// </summary>
public interface ISaqaImportService
{
    Task<int> ImportFromRowsAsync(IEnumerable<CsvRow> rows, CancellationToken ct = default);
}

public class SaqaImportService : ISaqaImportService
{
    private readonly AppDbContext _db;
    public SaqaImportService(AppDbContext db) => _db = db;

    public async Task<int> ImportFromRowsAsync(IEnumerable<CsvRow> rows, CancellationToken ct = default)
    {
        int count = 0;
        foreach (var row in rows)
        {
            var saqaId = row.GetValueOrDefault("SAQA ID") ?? row.GetValueOrDefault("saqa_id") ?? "";
            if (string.IsNullOrWhiteSpace(saqaId)) continue;

            var existing = _db.SaqaQualifications.FirstOrDefault(s => s.SaqaId == saqaId);
            if (existing is null)
            {
                existing = new SaqaQualification { SaqaId = saqaId };
                _db.SaqaQualifications.Add(existing);
            }

            existing.Title = row.GetValueOrDefault("Title") ?? existing.Title;
            existing.QualificationType = row.GetValueOrDefault("Qualification Type") ?? existing.QualificationType;
            existing.AwardingBody = row.GetValueOrDefault("Awarding Body") ?? existing.AwardingBody;
            existing.Status = row.GetValueOrDefault("Status") ?? existing.Status;
            if (int.TryParse(row.GetValueOrDefault("NQF Level"), out var nqf)) existing.NqfLevel = nqf;
            if (int.TryParse(row.GetValueOrDefault("Credits"), out var credits)) existing.Credits = credits;
            existing.LastSyncedAt = DateTime.UtcNow;
            count++;
        }

        _db.DataSyncLogs.Add(new DataSyncLog { SourceName = "SAQA", Success = true, RecordsProcessed = count });
        await _db.SaveChangesAsync(ct);
        return count;
    }
}
