using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOccupationEnrichmentAndLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "context_data",
                table: "ofo_codes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "context_outdoors",
                table: "ofo_codes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "context_people",
                table: "ofo_codes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "context_routine",
                table: "ofo_codes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "context_things",
                table: "ofo_codes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "demand",
                table: "ofo_codes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "enriched_at",
                table: "ofo_codes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "enrichment_model",
                table: "ofo_codes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "field_key",
                table: "ofo_codes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_published",
                table: "ofo_codes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "link",
                table: "ofo_codes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "riasec",
                table: "ofo_codes",
                type: "text[]",
                nullable: false,
                defaultValue: new List<string>());

            migrationBuilder.AddColumn<int>(
                name: "salary_max",
                table: "ofo_codes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "salary_min",
                table: "ofo_codes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "salary_range",
                table: "ofo_codes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "source",
                table: "ofo_codes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "subjects",
                table: "ofo_codes",
                type: "text[]",
                nullable: false,
                defaultValue: new List<string>());

            migrationBuilder.AddColumn<string>(
                name: "summary",
                table: "ofo_codes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "tasks",
                table: "ofo_codes",
                type: "text[]",
                nullable: false,
                defaultValue: new List<string>());

            migrationBuilder.CreateIndex(
                name: "ix_ofo_codes_field_key",
                table: "ofo_codes",
                column: "field_key");

            migrationBuilder.CreateIndex(
                name: "ix_ofo_codes_is_published",
                table: "ofo_codes",
                column: "is_published");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_ofo_codes_field_key",
                table: "ofo_codes");

            migrationBuilder.DropIndex(
                name: "ix_ofo_codes_is_published",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "context_data",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "context_outdoors",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "context_people",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "context_routine",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "context_things",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "demand",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "enriched_at",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "enrichment_model",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "field_key",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "is_published",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "link",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "riasec",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "salary_max",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "salary_min",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "salary_range",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "source",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "subjects",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "summary",
                table: "ofo_codes");

            migrationBuilder.DropColumn(
                name: "tasks",
                table: "ofo_codes");
        }
    }
}
