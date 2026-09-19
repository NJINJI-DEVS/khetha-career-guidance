using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLearnerPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "preferences",
                table: "matriculants",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "preferences",
                table: "matriculants");
        }
    }
}
