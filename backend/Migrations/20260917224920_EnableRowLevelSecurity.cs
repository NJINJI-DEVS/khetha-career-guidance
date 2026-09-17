using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    // The backend's own DB connection uses the Postgres superuser role and so bypasses
    // RLS regardless of what's defined here (see PROJECT-CONTEXT.md §3) — these policies
    // are defense-in-depth for any future direct-from-frontend Supabase access (e.g.
    // Realtime), not the current enforcement boundary. `anon`/`authenticated` are
    // Supabase-provisioned roles and `auth.uid()` is a Supabase-provided function;
    // neither exists on a vanilla Postgres instance.
    public partial class EnableRowLevelSecurity : Migration
    {
        private static readonly string[] ReferenceTables =
        {
            "universities", "courses", "course_subject_requirements", "ofo_codes", "saqa_qualifications"
        };

        private const string OwnsSubjectRow =
            "EXISTS (SELECT 1 FROM matriculants m WHERE m.id = matriculant_subjects.matriculant_id AND m.user_id = auth.uid())";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (var table in ReferenceTables)
            {
                migrationBuilder.Sql($"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;");
                migrationBuilder.Sql($"CREATE POLICY \"reference read\" ON {table} FOR SELECT TO anon, authenticated USING (true);");
            }

            migrationBuilder.Sql("ALTER TABLE matriculants ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("CREATE POLICY \"own profile select\" ON matriculants FOR SELECT TO authenticated USING (auth.uid() = user_id);");
            migrationBuilder.Sql("CREATE POLICY \"own profile insert\" ON matriculants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);");
            migrationBuilder.Sql("CREATE POLICY \"own profile update\" ON matriculants FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);");
            migrationBuilder.Sql("CREATE POLICY \"own profile delete\" ON matriculants FOR DELETE TO authenticated USING (auth.uid() = user_id);");

            migrationBuilder.Sql("ALTER TABLE matriculant_subjects ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql($"CREATE POLICY \"own subjects select\" ON matriculant_subjects FOR SELECT TO authenticated USING ({OwnsSubjectRow});");
            migrationBuilder.Sql($"CREATE POLICY \"own subjects insert\" ON matriculant_subjects FOR INSERT TO authenticated WITH CHECK ({OwnsSubjectRow});");
            migrationBuilder.Sql($"CREATE POLICY \"own subjects update\" ON matriculant_subjects FOR UPDATE TO authenticated USING ({OwnsSubjectRow}) WITH CHECK ({OwnsSubjectRow});");
            migrationBuilder.Sql($"CREATE POLICY \"own subjects delete\" ON matriculant_subjects FOR DELETE TO authenticated USING ({OwnsSubjectRow});");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var policy in new[] { "select", "insert", "update", "delete" })
            {
                migrationBuilder.Sql($"DROP POLICY \"own subjects {policy}\" ON matriculant_subjects;");
            }
            migrationBuilder.Sql("ALTER TABLE matriculant_subjects DISABLE ROW LEVEL SECURITY;");

            foreach (var policy in new[] { "select", "insert", "update", "delete" })
            {
                migrationBuilder.Sql($"DROP POLICY \"own profile {policy}\" ON matriculants;");
            }
            migrationBuilder.Sql("ALTER TABLE matriculants DISABLE ROW LEVEL SECURITY;");

            foreach (var table in ReferenceTables)
            {
                migrationBuilder.Sql($"DROP POLICY \"reference read\" ON {table};");
                migrationBuilder.Sql($"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;");
            }
        }
    }
}
