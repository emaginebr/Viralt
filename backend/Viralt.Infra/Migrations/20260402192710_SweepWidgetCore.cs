using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Viralt.Infra.Migrations
{
    /// <inheritdoc />
    public partial class SweepWidgetCore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "country_code",
                table: "clients",
                type: "character varying(2)",
                maxLength: 2,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "email_verified",
                table: "clients",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ip_address",
                table: "clients",
                type: "character varying(45)",
                maxLength: 45,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_disqualified",
                table: "clients",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_winner",
                table: "clients",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "referral_token",
                table: "clients",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "referred_by_client_id",
                table: "clients",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "total_entries",
                table: "clients",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "user_agent",
                table: "clients",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "completed_at",
                table: "client_entries",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "entries_earned",
                table: "client_entries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "verification_data",
                table: "client_entries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "verified",
                table: "client_entries",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "block_vpn",
                table: "campaigns",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<long>(
                name: "brand_id",
                table: "campaigns",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "entry_type",
                table: "campaigns",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "fb_pixel_id",
                table: "campaigns",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ga_tracking_id",
                table: "campaigns",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "geo_countries",
                table: "campaigns",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gtm_id",
                table: "campaigns",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_published",
                table: "campaigns",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "language",
                table: "campaigns",
                type: "character varying(5)",
                maxLength: 5,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "logo_image",
                table: "campaigns",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "max_entries_per_user",
                table: "campaigns",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "password",
                table: "campaigns",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "redirect_url",
                table: "campaigns",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "require_email_verification",
                table: "campaigns",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "slug",
                table: "campaigns",
                type: "character varying(260)",
                maxLength: 260,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "terms_url",
                table: "campaigns",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "theme_bg_color",
                table: "campaigns",
                type: "character varying(7)",
                maxLength: 7,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "theme_font",
                table: "campaigns",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "theme_primary_color",
                table: "campaigns",
                type: "character varying(7)",
                maxLength: 7,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "theme_secondary_color",
                table: "campaigns",
                type: "character varying(7)",
                maxLength: 7,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "tiktok_pixel_id",
                table: "campaigns",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "timezone",
                table: "campaigns",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "total_entries",
                table: "campaigns",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "total_participants",
                table: "campaigns",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "view_count",
                table: "campaigns",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "welcome_email_body",
                table: "campaigns",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "welcome_email_enabled",
                table: "campaigns",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "welcome_email_subject",
                table: "campaigns",
                type: "character varying(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "winner_count",
                table: "campaigns",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "external_entry_id",
                table: "campaign_entries",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "external_provider",
                table: "campaign_entries",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "icon",
                table: "campaign_entries",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "instructions",
                table: "campaign_entries",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "require_verification",
                table: "campaign_entries",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "sort_order",
                table: "campaign_entries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "target_url",
                table: "campaign_entries",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "brands",
                columns: table => new
                {
                    brand_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    slug = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    logo_image = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    primary_color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    custom_domain = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("brands_pkey", x => x.brand_id);
                });

            migrationBuilder.CreateTable(
                name: "campaign_views",
                columns: table => new
                {
                    view_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    campaign_id = table.Column<long>(type: "bigint", nullable: false),
                    viewed_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    referrer = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    country_code = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("campaign_views_pkey", x => x.view_id);
                    table.ForeignKey(
                        name: "fk_campaign_view",
                        column: x => x.campaign_id,
                        principalTable: "campaigns",
                        principalColumn: "campaign_id");
                });

            migrationBuilder.CreateTable(
                name: "prizes",
                columns: table => new
                {
                    prize_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    campaign_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    image = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    prize_type = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    coupon_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    min_entries_required = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("prizes_pkey", x => x.prize_id);
                    table.ForeignKey(
                        name: "fk_campaign_prize",
                        column: x => x.campaign_id,
                        principalTable: "campaigns",
                        principalColumn: "campaign_id");
                });

            migrationBuilder.CreateTable(
                name: "winners",
                columns: table => new
                {
                    winner_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    campaign_id = table.Column<long>(type: "bigint", nullable: false),
                    client_id = table.Column<long>(type: "bigint", nullable: false),
                    prize_id = table.Column<long>(type: "bigint", nullable: true),
                    selected_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    selection_method = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    notified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    claimed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    claim_data = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("winners_pkey", x => x.winner_id);
                    table.ForeignKey(
                        name: "fk_campaign_winner",
                        column: x => x.campaign_id,
                        principalTable: "campaigns",
                        principalColumn: "campaign_id");
                    table.ForeignKey(
                        name: "fk_client_winner",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id");
                    table.ForeignKey(
                        name: "fk_prize_winner",
                        column: x => x.prize_id,
                        principalTable: "prizes",
                        principalColumn: "prize_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_campaigns_brand_id",
                table: "campaigns",
                column: "brand_id");

            migrationBuilder.CreateIndex(
                name: "IX_campaign_views_campaign_id",
                table: "campaign_views",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "IX_prizes_campaign_id",
                table: "prizes",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "IX_winners_campaign_id",
                table: "winners",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "IX_winners_client_id",
                table: "winners",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_winners_prize_id",
                table: "winners",
                column: "prize_id");

            migrationBuilder.AddForeignKey(
                name: "fk_brand_campaign",
                table: "campaigns",
                column: "brand_id",
                principalTable: "brands",
                principalColumn: "brand_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_brand_campaign",
                table: "campaigns");

            migrationBuilder.DropTable(
                name: "brands");

            migrationBuilder.DropTable(
                name: "campaign_views");

            migrationBuilder.DropTable(
                name: "winners");

            migrationBuilder.DropTable(
                name: "prizes");

            migrationBuilder.DropIndex(
                name: "IX_campaigns_brand_id",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "country_code",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "email_verified",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "ip_address",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "is_disqualified",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "is_winner",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "referral_token",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "referred_by_client_id",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "total_entries",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "user_agent",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "completed_at",
                table: "client_entries");

            migrationBuilder.DropColumn(
                name: "entries_earned",
                table: "client_entries");

            migrationBuilder.DropColumn(
                name: "verification_data",
                table: "client_entries");

            migrationBuilder.DropColumn(
                name: "verified",
                table: "client_entries");

            migrationBuilder.DropColumn(
                name: "block_vpn",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "brand_id",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "entry_type",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "fb_pixel_id",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "ga_tracking_id",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "geo_countries",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "gtm_id",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "is_published",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "language",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "logo_image",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "max_entries_per_user",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "password",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "redirect_url",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "require_email_verification",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "slug",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "terms_url",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "theme_bg_color",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "theme_font",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "theme_primary_color",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "theme_secondary_color",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "tiktok_pixel_id",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "timezone",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "total_entries",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "total_participants",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "view_count",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "welcome_email_body",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "welcome_email_enabled",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "welcome_email_subject",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "winner_count",
                table: "campaigns");

            migrationBuilder.DropColumn(
                name: "external_entry_id",
                table: "campaign_entries");

            migrationBuilder.DropColumn(
                name: "external_provider",
                table: "campaign_entries");

            migrationBuilder.DropColumn(
                name: "icon",
                table: "campaign_entries");

            migrationBuilder.DropColumn(
                name: "instructions",
                table: "campaign_entries");

            migrationBuilder.DropColumn(
                name: "require_verification",
                table: "campaign_entries");

            migrationBuilder.DropColumn(
                name: "sort_order",
                table: "campaign_entries");

            migrationBuilder.DropColumn(
                name: "target_url",
                table: "campaign_entries");
        }
    }
}
