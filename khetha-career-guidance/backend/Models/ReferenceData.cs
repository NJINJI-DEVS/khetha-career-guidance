namespace CareerAdvisor.Api.Models;

/// <summary>
/// Organising Framework for Occupations (OFO) code — published periodically by the
/// Dept. of Employment & Labour / DHET as a spreadsheet, not a live API. Ingested
/// via the OfoImportService (see Services/OfoService.cs) rather than fetched at request time.
/// </summary>
public class OfoCode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;      // e.g. "2512-1" (Software Developer)
    public string Title { get; set; } = string.Empty;
    public string MajorGroup { get; set; } = string.Empty;
    public string SubMinorGroup { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// SAQA National Learners' Records Database (NLRD) qualification entry.
/// SAQA does not expose a public REST API; data is obtained via the SAQA
/// qualifications database export / MIS access agreement and re-synced periodically.
/// </summary>
public class SaqaQualification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SaqaId { get; set; } = string.Empty;    // SAQA Qualification ID
    public string Title { get; set; } = string.Empty;
    public int NqfLevel { get; set; }
    public int Credits { get; set; }
    public string QualificationType { get; set; } = string.Empty; // e.g. "Bachelor's Degree"
    public string AwardingBody { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // e.g. "Registered", "Re-registered"
    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>Tracks a scheduled/last-run ingest of an external source, for auditability.</summary>
public class DataSyncLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SourceName { get; set; } = string.Empty; // "OFO", "SAQA", "DHET-CAO", etc.
    public DateTime RunAt { get; set; } = DateTime.UtcNow;
    public bool Success { get; set; }
    public int RecordsProcessed { get; set; }
    public string? Notes { get; set; }
}
