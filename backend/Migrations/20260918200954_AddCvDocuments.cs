using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCvDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cv_documents",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    template = table.Column<string>(type: "text", nullable: false),
                    share_token = table.Column<string>(type: "text", nullable: true),
                    completeness = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cv_documents", x => x.user_id);
                });

            migrationBuilder.CreateIndex(
                name: "cv_documents_share_token_key",
                table: "cv_documents",
                column: "share_token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cv_documents");
        }
    }
}
