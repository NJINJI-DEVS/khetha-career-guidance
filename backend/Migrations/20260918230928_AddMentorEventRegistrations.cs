using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMentorEventRegistrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "mentor_event_registrations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    mentor_event_id = table.Column<Guid>(type: "uuid", nullable: false),
                    learner_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    learner_name = table.Column<string>(type: "text", nullable: false),
                    learner_grade = table.Column<string>(type: "text", nullable: true),
                    learner_province = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    accepted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    attended = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_mentor_event_registrations", x => x.id);
                    table.ForeignKey(
                        name: "fk_mentor_event_registrations_mentor_events_mentor_event_id",
                        column: x => x.mentor_event_id,
                        principalTable: "mentor_events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_mentor_event_registrations_learner",
                table: "mentor_event_registrations",
                column: "learner_user_id");

            migrationBuilder.CreateIndex(
                name: "mentor_event_registrations_unique",
                table: "mentor_event_registrations",
                columns: new[] { "mentor_event_id", "learner_user_id" },
                unique: true);

            // RLS on with no policies: default-deny for anon and authenticated,
            // as with audit_logs and admins. These rows name minors and give
            // their grade and province - the API reaches them as the owning
            // role, and nothing holding only the public anon key ever can.
            migrationBuilder.Sql("alter table mentor_event_registrations enable row level security;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "mentor_event_registrations");
        }
    }
}
