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

/// <summary>
/// A real, named certification, learnership or trade route that does not
/// require a matric (NSC) pass — Grade 9/10/11, ABET Level 4 or an NQF Level 1
/// qualification is the actual entry requirement. Shown at the bottom of the
/// careers directory for learners who won't or don't complete matric, so they
/// still see a real path forward rather than nothing.
///
/// Hand-compiled from public regulator/SETA/institution sources (not scraped
/// live, and not AI-generated) — see Source/SourceUrl on each row for the
/// citation. Seeded via INoMatricCertificationSeedService, admin-triggered,
/// the same provenance discipline as OfoCode.Source above.
/// </summary>
public class NoMatricCertification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;       // "TVET / NCV", "Artisan trade", "SETA learnership", "Security (PSIRA)", "Bookkeeping", "First aid"
    public string MinRequirement { get; set; } = string.Empty; // e.g. "Grade 9", "Grade 10", "No formal schooling required"
    public int? NqfLevel { get; set; }
    public string? DurationLabel { get; set; }                 // free text, e.g. "3 years", "6-12 months"
    public string Summary { get; set; } = string.Empty;        // plain-language description
    public string ProviderName { get; set; } = string.Empty;   // regulator/awarding body/college
    public string? ProviderWebsite { get; set; }
    public string SourceUrl { get; set; } = string.Empty;      // where this entry's facts were confirmed
    public DateTime LastVerifiedAt { get; set; } = DateTime.UtcNow;
    public int SortOrder { get; set; }
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
