using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class NormaliseVerificationTierKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Existing rows stored display labels; the client looks tiers up by
            // key and an unknown key crashed the mentor directory outright.
            migrationBuilder.Sql(@"
                update mentors
                   set verification_tiers = (
                       select coalesce(array_agg(
                                  case t
                                      when 'ID Verified'     then 'id'
                                      when 'Degree Verified' then 'degree'
                                      when 'NGO Vetted'      then 'ngo'
                                      else t
                                  end
                              ), '{}')
                         from unnest(verification_tiers) as t
                   )
                 where verification_tiers && array['ID Verified','Degree Verified','NGO Vetted'];
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
