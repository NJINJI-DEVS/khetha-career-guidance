using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMentorHub : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    action = table.Column<string>(type: "text", nullable: false),
                    entity_type = table.Column<string>(type: "text", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    details = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mentor_applications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    full_name = table.Column<string>(type: "text", nullable: false),
                    id_number = table.Column<string>(type: "text", nullable: false),
                    id_document_filename = table.Column<string>(type: "text", nullable: true),
                    work_email = table.Column<string>(type: "text", nullable: false),
                    institution = table.Column<string>(type: "text", nullable: false),
                    linked_in = table.Column<string>(type: "text", nullable: false),
                    licence_body = table.Column<string>(type: "text", nullable: false),
                    licence_number = table.Column<string>(type: "text", nullable: false),
                    claims_teacher = table.Column<bool>(type: "boolean", nullable: false),
                    partner_code = table.Column<string>(type: "text", nullable: false),
                    partner_name = table.Column<string>(type: "text", nullable: true),
                    transcript_filename = table.Column<string>(type: "text", nullable: true),
                    field = table.Column<string>(type: "text", nullable: false),
                    subjects = table.Column<string[]>(type: "text[]", nullable: false),
                    claim = table.Column<string>(type: "text", nullable: false),
                    submit_seconds = table.Column<int>(type: "integer", nullable: false),
                    duplicate_of = table.Column<string>(type: "text", nullable: true),
                    subject_mismatch = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    decided_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    decided_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    risk_score = table.Column<int>(type: "integer", nullable: false),
                    risk_verdict = table.Column<string>(type: "text", nullable: false),
                    risk_flags = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_mentor_applications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    target = table.Column<string>(type: "text", nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_roles", x => new { x.user_id, x.role });
                });

            migrationBuilder.CreateTable(
                name: "mentors",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    field = table.Column<string>(type: "text", nullable: false),
                    subjects = table.Column<string[]>(type: "text[]", nullable: false),
                    province = table.Column<string>(type: "text", nullable: false),
                    area = table.Column<string>(type: "text", nullable: false),
                    institution_or_employer = table.Column<string>(type: "text", nullable: false),
                    work_email = table.Column<string>(type: "text", nullable: false),
                    verification_tiers = table.Column<string[]>(type: "text[]", nullable: false),
                    bio = table.Column<string>(type: "text", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: true),
                    sessions_completed = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    source_application_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_mentors", x => x.id);
                    table.ForeignKey(
                        name: "fk_mentors_mentor_applications_source_application_id",
                        column: x => x.source_application_id,
                        principalTable: "mentor_applications",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "help_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    matriculant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    mentor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject = table.Column<string>(type: "text", nullable: false),
                    goal = table.Column<string>(type: "text", nullable: false),
                    need = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    attached_aps = table.Column<int>(type: "integer", nullable: false),
                    attached_marks_summary = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_help_requests", x => x.id);
                    table.ForeignKey(
                        name: "fk_help_requests_matriculants_matriculant_id",
                        column: x => x.matriculant_id,
                        principalTable: "matriculants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_help_requests_mentors_mentor_id",
                        column: x => x.mentor_id,
                        principalTable: "mentors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    help_request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_role = table.Column<string>(type: "text", nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    redacted_types = table.Column<string[]>(type: "text[]", nullable: false),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_messages", x => x.id);
                    table.ForeignKey(
                        name: "fk_messages_help_requests_help_request_id",
                        column: x => x.help_request_id,
                        principalTable: "help_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "recommendation_letters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    help_request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    issued_by_mentor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    strength = table.Column<string>(type: "text", nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    reference_number = table.Column<string>(type: "text", nullable: false),
                    issued_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_recommendation_letters", x => x.id);
                    table.ForeignKey(
                        name: "fk_recommendation_letters_help_requests_help_request_id",
                        column: x => x.help_request_id,
                        principalTable: "help_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_recommendation_letters_mentors_issued_by_mentor_id",
                        column: x => x.issued_by_mentor_id,
                        principalTable: "mentors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_entity",
                table: "audit_logs",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "ix_help_requests_matriculant_id",
                table: "help_requests",
                column: "matriculant_id");

            migrationBuilder.CreateIndex(
                name: "ix_help_requests_mentor_id",
                table: "help_requests",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "ix_help_requests_status",
                table: "help_requests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_mentor_applications_status",
                table: "mentor_applications",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_mentor_applications_user_id",
                table: "mentor_applications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "mentors_source_application_id_key",
                table: "mentors",
                column: "source_application_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "mentors_user_id_key",
                table: "mentors",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_messages_request_sent",
                table: "messages",
                columns: new[] { "help_request_id", "sent_at" });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_unread",
                table: "notifications",
                columns: new[] { "user_id", "is_read" });

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_letters_help_request_id",
                table: "recommendation_letters",
                column: "help_request_id");

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_letters_issued_by_mentor_id",
                table: "recommendation_letters",
                column: "issued_by_mentor_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "messages");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "recommendation_letters");

            migrationBuilder.DropTable(
                name: "user_roles");

            migrationBuilder.DropTable(
                name: "help_requests");

            migrationBuilder.DropTable(
                name: "mentors");

            migrationBuilder.DropTable(
                name: "mentor_applications");
        }
    }
}
