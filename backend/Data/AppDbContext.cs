using CareerAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace CareerAdvisor.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Matriculant> Matriculants => Set<Matriculant>();
    public DbSet<MatriculantSubject> MatriculantSubjects => Set<MatriculantSubject>();
    public DbSet<University> Universities => Set<University>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseSubjectRequirement> CourseSubjectRequirements => Set<CourseSubjectRequirement>();
    public DbSet<OfoCode> OfoCodes => Set<OfoCode>();
    public DbSet<SaqaQualification> SaqaQualifications => Set<SaqaQualification>();
    public DbSet<DataSyncLog> DataSyncLogs => Set<DataSyncLog>();

    public DbSet<Mentor> Mentors => Set<Mentor>();
    public DbSet<MentorApplication> MentorApplications => Set<MentorApplication>();
    public DbSet<HelpRequest> HelpRequests => Set<HelpRequest>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<RecommendationLetter> RecommendationLetters => Set<RecommendationLetter>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<CvDocument> CvDocuments => Set<CvDocument>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Table AND column names are snake_case to match Postgres/Supabase convention
        // (see Program.cs's UseSnakeCaseNamingConvention()) — table names below match
        // that convention's output already, so no explicit ToTable() calls are needed.

        modelBuilder.Entity<University>().HasIndex(u => u.Name).IsUnique().HasDatabaseName("universities_name_key");
        modelBuilder.Entity<University>().HasIndex(u => u.ShortCode).IsUnique().HasDatabaseName("universities_short_code_key");
        modelBuilder.Entity<University>().HasIndex(u => u.Province).HasDatabaseName("ix_universities_province");

        modelBuilder.Entity<Matriculant>().HasIndex(m => m.UserId).IsUnique().HasDatabaseName("matriculants_user_id_key");
        modelBuilder.Entity<Matriculant>().HasIndex(m => m.Province).HasDatabaseName("ix_matriculants_province");
        modelBuilder.Entity<Matriculant>().Property(m => m.ProfileData).HasColumnType("jsonb");

        modelBuilder.Entity<Matriculant>()
            .HasMany(m => m.Subjects)
            .WithOne(s => s.Matriculant)
            .HasForeignKey(s => s.MatriculantId)
            .OnDelete(DeleteBehavior.Cascade);

        // A learner can't have two rows for the same subject.
        modelBuilder.Entity<MatriculantSubject>()
            .HasIndex(s => new { s.MatriculantId, s.SubjectName })
            .IsUnique()
            .HasDatabaseName("matriculant_subjects_unique");
        modelBuilder.Entity<MatriculantSubject>()
            .HasIndex(s => s.MatriculantId)
            .HasDatabaseName("ix_matriculant_subjects_matriculant");

        modelBuilder.Entity<University>()
            .HasMany(u => u.Courses)
            .WithOne(c => c.University)
            .HasForeignKey(c => c.UniversityId)
            .OnDelete(DeleteBehavior.Cascade);

        // A university can't offer two courses with the same name.
        modelBuilder.Entity<Course>()
            .HasIndex(c => new { c.UniversityId, c.Name })
            .IsUnique()
            .HasDatabaseName("courses_university_name_key");
        modelBuilder.Entity<Course>().HasIndex(c => c.MinimumAps).HasDatabaseName("ix_courses_minimum_aps");
        modelBuilder.Entity<Course>().HasIndex(c => c.OfoCode).HasDatabaseName("ix_courses_ofo_code");
        modelBuilder.Entity<Course>().HasIndex(c => c.SaqaQualificationId).HasDatabaseName("ix_courses_saqa_qualification_id");

        modelBuilder.Entity<Course>()
            .HasMany(c => c.SubjectRequirements)
            .WithOne(r => r.Course)
            .HasForeignKey(r => r.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CourseSubjectRequirement>()
            .HasIndex(r => r.CourseId)
            .HasDatabaseName("ix_csr_course_id");
        modelBuilder.Entity<CourseSubjectRequirement>()
            .HasIndex(r => new { r.CourseId, r.AlternativeGroupKey })
            .HasDatabaseName("ix_csr_group");

        modelBuilder.Entity<OfoCode>().HasIndex(o => o.Code).IsUnique().HasDatabaseName("ofo_codes_code_key");
        modelBuilder.Entity<OfoCode>().HasIndex(o => o.MajorGroup).HasDatabaseName("ix_ofo_codes_major_group");
        // The learner-facing directory only ever queries published rows, filtered
        // by career field — without these every browse is a full table scan once
        // the catalogue is thousands of rows rather than twelve.
        modelBuilder.Entity<OfoCode>().HasIndex(o => o.IsPublished).HasDatabaseName("ix_ofo_codes_is_published");
        modelBuilder.Entity<OfoCode>().HasIndex(o => o.FieldKey).HasDatabaseName("ix_ofo_codes_field_key");

        modelBuilder.Entity<SaqaQualification>().HasIndex(s => s.SaqaId).IsUnique().HasDatabaseName("saqa_qualifications_saqa_id_key");
        modelBuilder.Entity<SaqaQualification>().HasIndex(s => s.NqfLevel).HasDatabaseName("ix_saqa_qualifications_nqf_level");

        // One CV per learner, keyed on the Supabase user id — no surrogate key,
        // because there is never a second row to disambiguate.
        modelBuilder.Entity<CvDocument>().HasKey(c => c.UserId);
        modelBuilder.Entity<CvDocument>().Property(c => c.Payload).HasColumnType("jsonb");
        // Partial-unique would be tidier, but a plain unique index over a nullable
        // column already allows many NULLs in Postgres, which is exactly what we
        // want: unlimited private CVs, one row per live share token.
        modelBuilder.Entity<CvDocument>().HasIndex(c => c.ShareToken).IsUnique()
            .HasDatabaseName("cv_documents_share_token_key");

        modelBuilder.Entity<DataSyncLog>()
            .HasIndex(d => new { d.SourceName, d.RunAt })
            .HasDatabaseName("ix_data_sync_logs_source_run")
            .IsDescending(false, true);

        // ---- Mentor hub ------------------------------------------------

        modelBuilder.Entity<Mentor>().HasIndex(m => m.UserId).IsUnique().HasDatabaseName("mentors_user_id_key");
        modelBuilder.Entity<Mentor>().HasIndex(m => m.SourceApplicationId).IsUnique().HasDatabaseName("mentors_source_application_id_key");
        modelBuilder.Entity<Mentor>()
            .HasOne(m => m.SourceApplication)
            .WithMany()
            .HasForeignKey(m => m.SourceApplicationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MentorApplication>().HasIndex(a => a.UserId).HasDatabaseName("ix_mentor_applications_user_id");
        modelBuilder.Entity<MentorApplication>().HasIndex(a => a.Status).HasDatabaseName("ix_mentor_applications_status");

        // RiskFlags is a structured jsonb column — Npgsql/EF Core don't auto-map a
        // List<record> to jsonb, so it needs an explicit column type plus a value
        // converter (JSON string round-trip) and a value comparer (EF's default
        // reference-equality tracking won't detect in-place mutations to a
        // materialized list; not needed today since flags are set once at insert
        // and never mutated afterwards, but the comparer keeps that safe if that changes).
        modelBuilder.Entity<MentorApplication>()
            .Property(a => a.RiskFlags)
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<RiskFlag>>(v, (JsonSerializerOptions?)null) ?? new List<RiskFlag>())
            .Metadata.SetValueComparer(new ValueComparer<List<RiskFlag>>(
                (a, b) => (a ?? new()).SequenceEqual(b ?? new()),
                v => v.Aggregate(0, (h, f) => HashCode.Combine(h, f.GetHashCode())),
                v => v.ToList()));

        modelBuilder.Entity<HelpRequest>()
            .HasOne(h => h.Matriculant)
            .WithMany()
            .HasForeignKey(h => h.MatriculantId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<HelpRequest>()
            .HasOne(h => h.Mentor)
            .WithMany()
            .HasForeignKey(h => h.MentorId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<HelpRequest>().HasIndex(h => h.MatriculantId).HasDatabaseName("ix_help_requests_matriculant_id");
        modelBuilder.Entity<HelpRequest>().HasIndex(h => h.MentorId).HasDatabaseName("ix_help_requests_mentor_id");
        modelBuilder.Entity<HelpRequest>().HasIndex(h => h.Status).HasDatabaseName("ix_help_requests_status");

        modelBuilder.Entity<Message>()
            .HasOne(m => m.HelpRequest)
            .WithMany(h => h.Messages)
            .HasForeignKey(m => m.HelpRequestId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Message>().HasIndex(m => new { m.HelpRequestId, m.SentAt }).HasDatabaseName("ix_messages_request_sent");

        modelBuilder.Entity<RecommendationLetter>()
            .HasOne(l => l.HelpRequest)
            .WithMany()
            .HasForeignKey(l => l.HelpRequestId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<RecommendationLetter>()
            .HasOne(l => l.IssuedByMentor)
            .WithMany()
            .HasForeignKey(l => l.IssuedByMentorId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<RecommendationLetter>().HasIndex(l => l.HelpRequestId).HasDatabaseName("ix_recommendation_letters_help_request_id");

        modelBuilder.Entity<Notification>().HasIndex(n => new { n.UserId, n.IsRead }).HasDatabaseName("ix_notifications_user_unread");

        modelBuilder.Entity<AuditLog>().HasIndex(a => new { a.EntityType, a.EntityId }).HasDatabaseName("ix_audit_logs_entity");

        // One row per account: this is now the single source of truth for which
        // role a Supabase user registered under (see AccountController), not just
        // an admin flag — so UserId alone must be unique, not (UserId, Role).
        modelBuilder.Entity<UserRole>().HasKey(r => r.UserId);
    }
}
