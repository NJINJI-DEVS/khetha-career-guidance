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
        // Table names in snake_case to match Postgres/Supabase convention.
        modelBuilder.Entity<Matriculant>().ToTable("matriculants");
        modelBuilder.Entity<MatriculantSubject>().ToTable("matriculant_subjects");
        modelBuilder.Entity<University>().ToTable("universities");
        modelBuilder.Entity<Course>().ToTable("courses");
        modelBuilder.Entity<CourseSubjectRequirement>().ToTable("course_subject_requirements");
        modelBuilder.Entity<OfoCode>().ToTable("ofo_codes");
        modelBuilder.Entity<SaqaQualification>().ToTable("saqa_qualifications");
        modelBuilder.Entity<DataSyncLog>().ToTable("data_sync_logs");

        modelBuilder.Entity<Matriculant>()
            .HasMany(m => m.Subjects)
            .WithOne(s => s.Matriculant)
            .HasForeignKey(s => s.MatriculantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<University>()
            .HasMany(u => u.Courses)
            .WithOne(c => c.University)
            .HasForeignKey(c => c.UniversityId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Course>()
            .HasMany(c => c.SubjectRequirements)
            .WithOne(r => r.Course)
            .HasForeignKey(r => r.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OfoCode>().HasIndex(o => o.Code).IsUnique();
        modelBuilder.Entity<SaqaQualification>().HasIndex(s => s.SaqaId).IsUnique();
    }
}
