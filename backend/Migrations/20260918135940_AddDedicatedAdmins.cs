using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDedicatedAdmins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admins",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admins", x => x.user_id);
                });

            // Preserve existing provisioned accounts; credentials stay in Auth.
            migrationBuilder.Sql("""
                INSERT INTO admins (user_id, email, is_active, created_at)
                SELECT r.user_id, lower(coalesce(u.email, '')), true, now()
                FROM user_roles r JOIN auth.users u ON u.id = r.user_id
                WHERE r.role = 'admin' AND u.deleted_at IS NULL;

                DELETE FROM user_roles r
                WHERE r.role = 'admin' AND EXISTS (SELECT 1 FROM admins a WHERE a.user_id = r.user_id);

                ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
                REVOKE ALL ON TABLE admins FROM anon, authenticated;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO user_roles (user_id, role)
                SELECT user_id, 'admin' FROM admins WHERE is_active
                ON CONFLICT (user_id) DO NOTHING;
                """);
            migrationBuilder.DropTable(
                name: "admins");
        }
    }
}
