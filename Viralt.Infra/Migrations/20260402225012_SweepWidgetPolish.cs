using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Viralt.Infra.Migrations
{
    /// <inheritdoc />
    public partial class SweepWidgetPolish : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "unlock_rewards",
                columns: table => new
                {
                    reward_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    campaign_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    entries_threshold = table.Column<int>(type: "integer", nullable: false),
                    reward_type = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    reward_value = table.Column<string>(type: "text", nullable: true),
                    image = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("unlock_rewards_pkey", x => x.reward_id);
                    table.ForeignKey(
                        name: "fk_campaign_reward",
                        column: x => x.campaign_id,
                        principalTable: "campaigns",
                        principalColumn: "campaign_id");
                });

            migrationBuilder.CreateTable(
                name: "webhooks",
                columns: table => new
                {
                    webhook_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    secret = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    events = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("webhooks_pkey", x => x.webhook_id);
                });

            migrationBuilder.CreateTable(
                name: "client_rewards",
                columns: table => new
                {
                    client_reward_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<long>(type: "bigint", nullable: false),
                    reward_id = table.Column<long>(type: "bigint", nullable: false),
                    unlocked_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("client_rewards_pkey", x => x.client_reward_id);
                    table.ForeignKey(
                        name: "fk_client_reward",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id");
                    table.ForeignKey(
                        name: "fk_reward_client_reward",
                        column: x => x.reward_id,
                        principalTable: "unlock_rewards",
                        principalColumn: "reward_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_client_rewards_client_id",
                table: "client_rewards",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_client_rewards_reward_id",
                table: "client_rewards",
                column: "reward_id");

            migrationBuilder.CreateIndex(
                name: "IX_unlock_rewards_campaign_id",
                table: "unlock_rewards",
                column: "campaign_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "client_rewards");

            migrationBuilder.DropTable(
                name: "webhooks");

            migrationBuilder.DropTable(
                name: "unlock_rewards");
        }
    }
}
