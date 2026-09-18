using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "data_sync_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_name = table.Column<string>(type: "text", nullable: false),
                    run_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    success = table.Column<bool>(type: "boolean", nullable: false),
                    records_processed = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_data_sync_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "matriculants",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    matric_year = table.Column<int>(type: "integer", nullable: false),
                    province = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_matriculants", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ofo_codes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    major_group = table.Column<string>(type: "text", nullable: false),
                    sub_minor_group = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    last_synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ofo_codes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "saqa_qualifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    saqa_id = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    nqf_level = table.Column<int>(type: "integer", nullable: false),
                    credits = table.Column<int>(type: "integer", nullable: false),
                    qualification_type = table.Column<string>(type: "text", nullable: false),
                    awarding_body = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    last_synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_saqa_qualifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "universities",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    short_code = table.Column<string>(type: "text", nullable: false),
                    province = table.Column<string>(type: "text", nullable: false),
                    website = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_universities", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "matriculant_subjects",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    matriculant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_name = table.Column<string>(type: "text", nullable: false),
                    percentage = table.Column<int>(type: "integer", nullable: false),
                    is_home_language = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_matriculant_subjects", x => x.id);
                    table.ForeignKey(
                        name: "fk_matriculant_subjects_matriculants_matriculant_id",
                        column: x => x.matriculant_id,
                        principalTable: "matriculants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "courses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    university_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    faculty_name = table.Column<string>(type: "text", nullable: false),
                    minimum_aps = table.Column<int>(type: "integer", nullable: false),
                    saqa_qualification_id = table.Column<string>(type: "text", nullable: true),
                    ofo_code = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
                    table.ForeignKey(
                        name: "fk_courses_universities_university_id",
                        column: x => x.university_id,
                        principalTable: "universities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_subject_requirements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_name = table.Column<string>(type: "text", nullable: false),
                    minimum_percentage = table.Column<int>(type: "integer", nullable: false),
                    is_compulsory = table.Column<bool>(type: "boolean", nullable: false),
                    alternative_group_key = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_subject_requirements", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_subject_requirements_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_csr_course_id",
                table: "course_subject_requirements",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_csr_group",
                table: "course_subject_requirements",
                columns: new[] { "course_id", "alternative_group_key" });

            migrationBuilder.CreateIndex(
                name: "courses_university_name_key",
                table: "courses",
                columns: new[] { "university_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_courses_minimum_aps",
                table: "courses",
                column: "minimum_aps");

            migrationBuilder.CreateIndex(
                name: "ix_courses_ofo_code",
                table: "courses",
                column: "ofo_code");

            migrationBuilder.CreateIndex(
                name: "ix_courses_saqa_qualification_id",
                table: "courses",
                column: "saqa_qualification_id");

            migrationBuilder.CreateIndex(
                name: "ix_data_sync_logs_source_run",
                table: "data_sync_logs",
                columns: new[] { "source_name", "run_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_matriculant_subjects_matriculant",
                table: "matriculant_subjects",
                column: "matriculant_id");

            migrationBuilder.CreateIndex(
                name: "matriculant_subjects_unique",
                table: "matriculant_subjects",
                columns: new[] { "matriculant_id", "subject_name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_matriculants_province",
                table: "matriculants",
                column: "province");

            migrationBuilder.CreateIndex(
                name: "matriculants_user_id_key",
                table: "matriculants",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ofo_codes_major_group",
                table: "ofo_codes",
                column: "major_group");

            migrationBuilder.CreateIndex(
                name: "ofo_codes_code_key",
                table: "ofo_codes",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_saqa_qualifications_nqf_level",
                table: "saqa_qualifications",
                column: "nqf_level");

            migrationBuilder.CreateIndex(
                name: "saqa_qualifications_saqa_id_key",
                table: "saqa_qualifications",
                column: "saqa_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_universities_province",
                table: "universities",
                column: "province");

            migrationBuilder.CreateIndex(
                name: "universities_name_key",
                table: "universities",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "universities_short_code_key",
                table: "universities",
                column: "short_code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "course_subject_requirements");

            migrationBuilder.DropTable(
                name: "data_sync_logs");

            migrationBuilder.DropTable(
                name: "matriculant_subjects");

            migrationBuilder.DropTable(
                name: "ofo_codes");

            migrationBuilder.DropTable(
                name: "saqa_qualifications");

            migrationBuilder.DropTable(
                name: "courses");

            migrationBuilder.DropTable(
                name: "matriculants");

            migrationBuilder.DropTable(
                name: "universities");
        }
    }
}
