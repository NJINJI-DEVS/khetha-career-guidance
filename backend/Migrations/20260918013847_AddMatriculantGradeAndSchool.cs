using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMatriculantGradeAndSchool : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "grade",
                table: "matriculants",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "school",
                table: "matriculants",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "grade",
                table: "matriculants");

            migrationBuilder.DropColumn(
                name: "school",
                table: "matriculants");
        }
    }
}
