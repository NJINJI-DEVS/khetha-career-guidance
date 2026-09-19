using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMentorEventsAndSignupDevice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "signup_device_type",
                table: "matriculants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "signup_platform",
                table: "matriculants",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "mentor_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    mentor_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    mentor_name = table.Column<string>(type: "text", nullable: false),
                    mentor_role = table.Column<string>(type: "text", nullable: false),
                    kind = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    impact = table.Column<string>(type: "text", nullable: false),
                    starts_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ends_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    venue = table.Column<string>(type: "text", nullable: false),
                    province = table.Column<string>(type: "text", nullable: false),
                    capacity = table.Column<int>(type: "integer", nullable: true),
                    is_online = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    decided_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    decided_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    decision_note = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_mentor_events", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_mentor_events_mentor",
                table: "mentor_events",
                column: "mentor_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_mentor_events_status",
                table: "mentor_events",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_mentor_events_status_starts",
                table: "mentor_events",
                columns: new[] { "status", "starts_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "mentor_events");

            migrationBuilder.DropColumn(
                name: "signup_device_type",
                table: "matriculants");

            migrationBuilder.DropColumn(
                name: "signup_platform",
                table: "matriculants");
        }
    }
}
