using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Viralt.Infra.Migrations
{
    /// <inheritdoc />
    public partial class SweepWidgetReferralContest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "referrals",
                columns: table => new
                {
                    referral_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    campaign_id = table.Column<long>(type: "bigint", nullable: false),
                    referrer_client_id = table.Column<long>(type: "bigint", nullable: false),
                    referred_client_id = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    bonus_entries_awarded = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("referrals_pkey", x => x.referral_id);
                    table.ForeignKey(
                        name: "fk_campaign_referral",
                        column: x => x.campaign_id,
                        principalTable: "campaigns",
                        principalColumn: "campaign_id");
                    table.ForeignKey(
                        name: "fk_referred_client",
                        column: x => x.referred_client_id,
                        principalTable: "clients",
                        principalColumn: "client_id");
                    table.ForeignKey(
                        name: "fk_referrer_client",
                        column: x => x.referrer_client_id,
                        principalTable: "clients",
                        principalColumn: "client_id");
                });

            migrationBuilder.CreateTable(
                name: "submissions",
                columns: table => new
                {
                    submission_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    campaign_id = table.Column<long>(type: "bigint", nullable: false),
                    client_id = table.Column<long>(type: "bigint", nullable: false),
                    file_url = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    file_type = table.Column<int>(type: "integer", nullable: false),
                    caption = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    vote_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    judge_score = table.Column<decimal>(type: "numeric", nullable: true),
                    submitted_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("submissions_pkey", x => x.submission_id);
                    table.ForeignKey(
                        name: "fk_campaign_submission",
                        column: x => x.campaign_id,
                        principalTable: "campaigns",
                        principalColumn: "campaign_id");
                    table.ForeignKey(
                        name: "fk_client_submission",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id");
                });

            migrationBuilder.CreateTable(
                name: "votes",
                columns: table => new
                {
                    vote_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    submission_id = table.Column<long>(type: "bigint", nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    voted_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("votes_pkey", x => x.vote_id);
                    table.ForeignKey(
                        name: "fk_submission_vote",
                        column: x => x.submission_id,
                        principalTable: "submissions",
                        principalColumn: "submission_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_referrals_campaign_id",
                table: "referrals",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "IX_referrals_referred_client_id",
                table: "referrals",
                column: "referred_client_id");

            migrationBuilder.CreateIndex(
                name: "IX_referrals_referrer_client_id",
                table: "referrals",
                column: "referrer_client_id");

            migrationBuilder.CreateIndex(
                name: "IX_submissions_campaign_id",
                table: "submissions",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "IX_submissions_client_id",
                table: "submissions",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_votes_submission_id",
                table: "votes",
                column: "submission_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "referrals");

            migrationBuilder.DropTable(
                name: "votes");

            migrationBuilder.DropTable(
                name: "submissions");
        }
    }
}
