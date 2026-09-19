using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserConsent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "user_consents",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    core = table.Column<bool>(type: "boolean", nullable: false),
                    ncap = table.Column<bool>(type: "boolean", nullable: false),
                    notify = table.Column<bool>(type: "boolean", nullable: false),
                    research = table.Column<bool>(type: "boolean", nullable: false),
                    is_minor = table.Column<bool>(type: "boolean", nullable: false),
                    guardian_name = table.Column<string>(type: "text", nullable: true),
                    guardian_relation = table.Column<string>(type: "text", nullable: true),
                    guardian_contact = table.Column<string>(type: "text", nullable: true),
                    version = table.Column<int>(type: "integer", nullable: false),
                    accepted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_consents", x => x.user_id);
                });

            // RLS on with no policies: default-deny for anon and authenticated.
            // These rows carry a minor's guardian name and contact number, which
            // is exactly the personal information POPIA treats as special.
            migrationBuilder.Sql("alter table user_consents enable row level security;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_consents");
        }
    }
}
