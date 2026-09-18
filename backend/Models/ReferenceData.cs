namespace CareerAdvisor.Api.Models;

/// <summary>
/// Organising Framework for Occupations (OFO) code — published periodically by the
/// Dept. of Employment & Labour / DHET as a spreadsheet, not a live API. Ingested
/// via the OfoImportService (see Services/OfoService.cs) rather than fetched at request time.
/// </summary>
public class OfoCode
{
    // ---- Authoritative: comes from the published OFO file, never invented -----
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;      // e.g. "2512-1" (Software Developer)
    public string Title { get; set; } = string.Empty;
    public string MajorGroup { get; set; } = string.Empty;
    public string SubMinorGroup { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Where a learner can read the authoritative record — the NCAP
    /// occupation page where one exists, otherwise the source document.</summary>
    public string? Link { get; set; }

    /// <summary>Provenance, so the UI can say what is official and what is not:
    /// "ofo-file" (published OFO), "ncap" (scraped), "gemini" (AI-generated),
    /// "seed" (hand-written demo data). Required by the build checklist's
    /// content-provenance item.</summary>
    public string Source { get; set; } = "ofo-file";

    // ---- Learner-facing enrichment -------------------------------------------
    // The published OFO carries a code, a title, a group and a formal
    // description. It carries none of what a school leaver actually needs, and
    // none of what this app's matching engines read. These fields are generated
    // (see IOccupationEnrichmentService) and are always attributable via
    // EnrichmentModel — they are not part of the official record.

    /// <summary>One plain-language sentence. Grade 9 reading level, not OFO prose.</summary>
    public string? Summary { get; set; }

    /// <summary>What the job actually involves day to day.</summary>
    public List<string> Tasks { get; set; } = new();

    /// <summary>Holland codes, constrained to R I A S E C — the Career Choice
    /// engine matches on these, so anything outside that set breaks it.</summary>
    public List<string> Riasec { get; set; } = new();

    /// <summary>NSC subject keys (maths, physci, …) matching data/subjects.js.</summary>
    public List<string> Subjects { get; set; } = new();

    /// <summary>Career field key matching the frontend's FIELDS (stem, health, …).</summary>
    public string? FieldKey { get; set; }

    public string? Demand { get; set; }        // "Scarce skill", "High demand", …
    public string? SalaryRange { get; set; }   // display string
    public int? SalaryMin { get; set; }        // monthly ZAR, for sorting/filtering
    public int? SalaryMax { get; set; }

    // Job Fit matches on these five axes, each 0-4. Stored as columns rather
    // than jsonb so they can be filtered and sorted in SQL.
    public int ContextPeople { get; set; }
    public int ContextData { get; set; }
    public int ContextThings { get; set; }
    public int ContextOutdoors { get; set; }
    public int ContextRoutine { get; set; }

    /// <summary>Which model produced the enrichment, so a bad batch can be found
    /// and regenerated.</summary>
    public string? EnrichmentModel { get; set; }
    public DateTime? EnrichedAt { get; set; }

    /// <summary>Only published rows reach learners. An imported-but-unenriched
    /// occupation has no summary, no subjects and no RIASEC, so showing it would
    /// break both matching engines and tell the learner nothing.</summary>
    public bool IsPublished { get; set; }
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
