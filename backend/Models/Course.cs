using System.Text.Json.Serialization;

namespace CareerAdvisor.Api.Models;

public class University
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;       // e.g. "University of Pretoria"
    public string ShortCode { get; set; } = string.Empty;  // e.g. "UP"
    public string Province { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;

    public ICollection<Course> Courses { get; set; } = new List<Course>();
}

/// <summary>A degree/diploma offered by a university, e.g. "BSc Computer Science".</summary>
public class Course
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UniversityId { get; set; }

    // Back-reference only — not serialized, same cycle hazard as
    // MatriculantSubject.Matriculant (see that file's comment).
    [JsonIgnore]
    public University? University { get; set; }

    public string Name { get; set; } = string.Empty;
    public string FacultyName { get; set; } = string.Empty;
    public int MinimumAps { get; set; }

    // Links to external classification systems
    public string? SaqaQualificationId { get; set; }   // FK -> SaqaQualification.SaqaId
    public string? OfoCode { get; set; }                // Linked occupation this course leads to

    public ICollection<CourseSubjectRequirement> SubjectRequirements { get; set; } = new List<CourseSubjectRequirement>();
}

/// <summary>A minimum-subject-percentage requirement for a course, e.g. Mathematics >= 60%.</summary>
public class CourseSubjectRequirement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }

    // Back-reference only — not serialized, same cycle hazard noted above.
    [JsonIgnore]
    public Course? Course { get; set; }

    public string SubjectName { get; set; } = string.Empty;
    public int MinimumPercentage { get; set; }
    public bool IsCompulsory { get; set; } = true; // false = "one of" alternative subject group
    public string? AlternativeGroupKey { get; set; } // groups OR-alternatives, e.g. "MATH_OR_MATHLIT"
}
