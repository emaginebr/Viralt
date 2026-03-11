using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Viralt.Infra.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    slug = table.Column<string>(type: "character varying(85)", maxLength: 85, nullable: true),
                    name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    email = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    password = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    plan = table.Column<int>(type: "integer", nullable: true),
                    token = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    recovery_hash = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    image = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("users_pkey", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "campaigns",
                columns: table => new
                {
                    campaign_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    start_time = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    end_time = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    name_required = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    email_required = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    phone_required = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    min_age = table.Column<int>(type: "integer", nullable: true),
                    bg_image = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    top_image = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    youtube_url = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    custom_css = table.Column<string>(type: "text", nullable: true),
                    min_entry = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("campaigns_pkey", x => x.campaign_id);
                    table.ForeignKey(
                        name: "fk_user_campaign",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "campaign_entries",
                columns: table => new
                {
                    entry_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    campaign_id = table.Column<long>(type: "bigint", nullable: false),
                    entry_type = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    entries = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    daily = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    mandatory = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    entry_label = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    entry_value = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("campaign_entries_pkey", x => x.entry_id);
                    table.ForeignKey(
                        name: "fk_campaign_entry",
                        column: x => x.campaign_id,
                        principalTable: "campaigns",
                        principalColumn: "campaign_id");
                });

            migrationBuilder.CreateTable(
                name: "campaign_fields",
                columns: table => new
                {
                    field_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    campaign_id = table.Column<long>(type: "bigint", nullable: false),
                    field_type = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    required = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("campaign_fields_pkey", x => x.field_id);
                    table.ForeignKey(
                        name: "fk_campaign_field",
                        column: x => x.campaign_id,
                        principalTable: "campaigns",
                        principalColumn: "campaign_id");
                });

            migrationBuilder.CreateTable(
                name: "clients",
                columns: table => new
                {
                    client_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    campaign_id = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    token = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    name = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    email = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    birthday = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("clients_pkey", x => x.client_id);
                    table.ForeignKey(
                        name: "fk_campaign_clients",
                        column: x => x.campaign_id,
                        principalTable: "campaigns",
                        principalColumn: "campaign_id");
                });

            migrationBuilder.CreateTable(
                name: "campaign_entry_options",
                columns: table => new
                {
                    option_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    entry_id = table.Column<long>(type: "bigint", nullable: false),
                    option_key = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    option_value = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("campaign_entry_options_pkey", x => x.option_id);
                    table.ForeignKey(
                        name: "fk_entry_options",
                        column: x => x.entry_id,
                        principalTable: "campaign_entries",
                        principalColumn: "entry_id");
                });

            migrationBuilder.CreateTable(
                name: "campaign_field_options",
                columns: table => new
                {
                    option_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    field_id = table.Column<long>(type: "bigint", nullable: false),
                    option_key = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    option_value = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("campaign_field_options_pkey", x => x.option_id);
                    table.ForeignKey(
                        name: "fk_field_options",
                        column: x => x.field_id,
                        principalTable: "campaign_fields",
                        principalColumn: "field_id");
                });

            migrationBuilder.CreateTable(
                name: "client_entries",
                columns: table => new
                {
                    entry_id = table.Column<long>(type: "bigint", nullable: false),
                    client_entry_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    entry_value = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("client_entries_pkey", x => x.entry_id);
                    table.ForeignKey(
                        name: "fk_client_entry_client",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id");
                    table.ForeignKey(
                        name: "fk_client_entry_entry",
                        column: x => x.entry_id,
                        principalTable: "campaign_entries",
                        principalColumn: "entry_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_campaign_entries_campaign_id",
                table: "campaign_entries",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "IX_campaign_entry_options_entry_id",
                table: "campaign_entry_options",
                column: "entry_id");

            migrationBuilder.CreateIndex(
                name: "IX_campaign_field_options_field_id",
                table: "campaign_field_options",
                column: "field_id");

            migrationBuilder.CreateIndex(
                name: "IX_campaign_fields_campaign_id",
                table: "campaign_fields",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "IX_campaigns_user_id",
                table: "campaigns",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_client_entries_client_id",
                table: "client_entries",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_clients_campaign_id",
                table: "clients",
                column: "campaign_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "campaign_entry_options");

            migrationBuilder.DropTable(
                name: "campaign_field_options");

            migrationBuilder.DropTable(
                name: "client_entries");

            migrationBuilder.DropTable(
                name: "campaign_fields");

            migrationBuilder.DropTable(
                name: "clients");

            migrationBuilder.DropTable(
                name: "campaign_entries");

            migrationBuilder.DropTable(
                name: "campaigns");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
