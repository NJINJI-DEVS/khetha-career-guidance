using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    // Same defense-in-depth caveat as EnableRowLevelSecurity.cs: the backend's own
    // DB connection is a superuser and bypasses RLS, so these policies aren't the
    // real enforcement boundary (the controllers are) — they're for any future
    // direct-from-frontend Supabase access.
    public partial class EnableMentorHubRowLevelSecurity : Migration
    {
        // A row is "mine" if I'm the matriculant OR the mentor on the thread.
        private const string OwnsHelpRequest =
            "EXISTS (SELECT 1 FROM matriculants m WHERE m.id = help_requests.matriculant_id AND m.user_id = auth.uid()) " +
            "OR EXISTS (SELECT 1 FROM mentors me WHERE me.id = help_requests.mentor_id AND me.user_id = auth.uid())";

        private const string OwnsMessageThread =
            "EXISTS (SELECT 1 FROM help_requests hr JOIN matriculants m ON m.id = hr.matriculant_id " +
            "WHERE hr.id = messages.help_request_id AND m.user_id = auth.uid()) " +
            "OR EXISTS (SELECT 1 FROM help_requests hr JOIN mentors me ON me.id = hr.mentor_id " +
            "WHERE hr.id = messages.help_request_id AND me.user_id = auth.uid())";

        private const string OwnsLetterThread =
            "EXISTS (SELECT 1 FROM help_requests hr JOIN matriculants m ON m.id = hr.matriculant_id " +
            "WHERE hr.id = recommendation_letters.help_request_id AND m.user_id = auth.uid()) " +
            "OR EXISTS (SELECT 1 FROM help_requests hr JOIN mentors me ON me.id = hr.mentor_id " +
            "WHERE hr.id = recommendation_letters.help_request_id AND me.user_id = auth.uid())";

        private const string IsIssuingMentor =
            "EXISTS (SELECT 1 FROM mentors me WHERE me.id = recommendation_letters.issued_by_mentor_id AND me.user_id = auth.uid())";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // mentors: any authenticated user can browse (gated by [Authorize] at
            // the API layer, since unlike universities/courses this carries PII);
            // only the mentor themselves can insert/update their own row.
            migrationBuilder.Sql("ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("CREATE POLICY \"mentor read\" ON mentors FOR SELECT TO authenticated USING (true);");
            migrationBuilder.Sql("CREATE POLICY \"own mentor insert\" ON mentors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);");
            migrationBuilder.Sql("CREATE POLICY \"own mentor update\" ON mentors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);");

            // mentor_applications: single-owner, same shape as matriculants.
            migrationBuilder.Sql("ALTER TABLE mentor_applications ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("CREATE POLICY \"own application select\" ON mentor_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);");
            migrationBuilder.Sql("CREATE POLICY \"own application insert\" ON mentor_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);");

            // user_roles: a user may check their own role; nothing may write to it
            // directly (roles are granted via a one-time manual SQL insert only).
            migrationBuilder.Sql("ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("CREATE POLICY \"own role select\" ON user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);");

            // help_requests / messages: dual-owner — both the learner and the
            // mentor on the thread need access. Column-level restrictions (e.g.
            // learner edits goal/need, mentor only edits status) aren't expressible
            // in RLS and stay a controller-only check.
            migrationBuilder.Sql("ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql($"CREATE POLICY \"help request select\" ON help_requests FOR SELECT TO authenticated USING ({OwnsHelpRequest});");
            migrationBuilder.Sql($"CREATE POLICY \"help request update\" ON help_requests FOR UPDATE TO authenticated USING ({OwnsHelpRequest}) WITH CHECK ({OwnsHelpRequest});");
            migrationBuilder.Sql("CREATE POLICY \"help request insert\" ON help_requests FOR INSERT TO authenticated WITH CHECK (" +
                "EXISTS (SELECT 1 FROM matriculants m WHERE m.id = help_requests.matriculant_id AND m.user_id = auth.uid()));");

            migrationBuilder.Sql("ALTER TABLE messages ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql($"CREATE POLICY \"message select\" ON messages FOR SELECT TO authenticated USING ({OwnsMessageThread});");
            // Parenthesized explicitly: SQL's AND binds tighter than OR, so without
            // the parens around OwnsMessageThread, "A OR B AND sender=me" parses as
            // "A OR (B AND sender=me)" — the learner side (A) would need no
            // sender_user_id check at all, letting a learner insert a message
            // claiming to be from anyone as long as they're a party to the thread.
            migrationBuilder.Sql($"CREATE POLICY \"message insert\" ON messages FOR INSERT TO authenticated WITH CHECK (({OwnsMessageThread}) AND sender_user_id = auth.uid());");

            // recommendation_letters: both parties can read; only the issuing mentor can insert.
            migrationBuilder.Sql("ALTER TABLE recommendation_letters ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql($"CREATE POLICY \"letter select\" ON recommendation_letters FOR SELECT TO authenticated USING ({OwnsLetterThread});");
            migrationBuilder.Sql($"CREATE POLICY \"letter insert\" ON recommendation_letters FOR INSERT TO authenticated WITH CHECK ({IsIssuingMentor});");

            // notifications: owner can read/mark-read; no INSERT policy at all —
            // these are only ever created by server-side actions, never directly
            // by a user, so the absence of a policy default-denies that correctly.
            migrationBuilder.Sql("ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("CREATE POLICY \"own notification select\" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);");
            migrationBuilder.Sql("CREATE POLICY \"own notification update\" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);");

            // audit_logs: RLS enabled, zero policies — only the backend's superuser
            // connection ever touches this table.
            migrationBuilder.Sql("ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;");

            migrationBuilder.Sql("DROP POLICY \"own notification update\" ON notifications;");
            migrationBuilder.Sql("DROP POLICY \"own notification select\" ON notifications;");
            migrationBuilder.Sql("ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;");

            migrationBuilder.Sql("DROP POLICY \"letter insert\" ON recommendation_letters;");
            migrationBuilder.Sql("DROP POLICY \"letter select\" ON recommendation_letters;");
            migrationBuilder.Sql("ALTER TABLE recommendation_letters DISABLE ROW LEVEL SECURITY;");

            migrationBuilder.Sql("DROP POLICY \"message insert\" ON messages;");
            migrationBuilder.Sql("DROP POLICY \"message select\" ON messages;");
            migrationBuilder.Sql("ALTER TABLE messages DISABLE ROW LEVEL SECURITY;");

            migrationBuilder.Sql("DROP POLICY \"help request insert\" ON help_requests;");
            migrationBuilder.Sql("DROP POLICY \"help request update\" ON help_requests;");
            migrationBuilder.Sql("DROP POLICY \"help request select\" ON help_requests;");
            migrationBuilder.Sql("ALTER TABLE help_requests DISABLE ROW LEVEL SECURITY;");

            migrationBuilder.Sql("DROP POLICY \"own role select\" ON user_roles;");
            migrationBuilder.Sql("ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;");

            migrationBuilder.Sql("DROP POLICY \"own application insert\" ON mentor_applications;");
            migrationBuilder.Sql("DROP POLICY \"own application select\" ON mentor_applications;");
            migrationBuilder.Sql("ALTER TABLE mentor_applications DISABLE ROW LEVEL SECURITY;");

            migrationBuilder.Sql("DROP POLICY \"own mentor update\" ON mentors;");
            migrationBuilder.Sql("DROP POLICY \"own mentor insert\" ON mentors;");
            migrationBuilder.Sql("DROP POLICY \"mentor read\" ON mentors;");
            migrationBuilder.Sql("ALTER TABLE mentors DISABLE ROW LEVEL SECURITY;");
        }
    }
}
