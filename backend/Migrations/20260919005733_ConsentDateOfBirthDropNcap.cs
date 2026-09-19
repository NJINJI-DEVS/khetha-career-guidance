using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class ConsentDateOfBirthDropNcap : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Dropping `ncap` is flagged by EF as data loss, and is deliberate.
            // The "Sync with my NCAP account" consent item was removed as part
            // of the GovTech honesty audit -- the panel it described was not
            // real -- so this column recorded agreement to something the app
            // never actually does. Keeping it would mean holding a consent we
            // do not ask for and cannot act on.
            migrationBuilder.DropColumn(
                name: "ncap",
                table: "user_consents");

            migrationBuilder.AddColumn<DateOnly>(
                name: "date_of_birth",
                table: "user_consents",
                type: "date",
                nullable: true);

            // Backfill from any profile that already recorded one, so the two
            // learners who consented before this column existed are not asked
            // for a date of birth they have already given.
            migrationBuilder.Sql(@"
                update user_consents c
                   set date_of_birth = m.date_of_birth
                  from matriculants m
                 where m.user_id = c.user_id
                   and m.date_of_birth is not null
                   and c.date_of_birth is null;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "date_of_birth",
                table: "user_consents");

            migrationBuilder.AddColumn<bool>(
                name: "ncap",
                table: "user_consents",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
