using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeUserRolePrimaryKeyToUserIdOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "pk_user_roles",
                table: "user_roles");

            migrationBuilder.AddPrimaryKey(
                name: "pk_user_roles",
                table: "user_roles",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "pk_user_roles",
                table: "user_roles");

            migrationBuilder.AddPrimaryKey(
                name: "pk_user_roles",
                table: "user_roles",
                columns: new[] { "user_id", "role" });
        }
    }
}
