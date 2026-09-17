using CareerAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;

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

        modelBuilder.Entity<SaqaQualification>().HasIndex(s => s.SaqaId).IsUnique().HasDatabaseName("saqa_qualifications_saqa_id_key");
        modelBuilder.Entity<SaqaQualification>().HasIndex(s => s.NqfLevel).HasDatabaseName("ix_saqa_qualifications_nqf_level");

        modelBuilder.Entity<DataSyncLog>()
            .HasIndex(d => new { d.SourceName, d.RunAt })
            .HasDatabaseName("ix_data_sync_logs_source_run")
            .IsDescending(false, true);
    }
}
