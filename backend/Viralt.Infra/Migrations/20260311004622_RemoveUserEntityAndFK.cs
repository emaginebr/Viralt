using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Viralt.Infra.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUserEntityAndFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_user_campaign",
                table: "campaigns");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropIndex(
                name: "IX_campaigns_user_id",
                table: "campaigns");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    email = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    image = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    password = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    plan = table.Column<int>(type: "integer", nullable: true),
                    recovery_hash = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    slug = table.Column<string>(type: "character varying(85)", maxLength: 85, nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    token = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("users_pkey", x => x.user_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_campaigns_user_id",
                table: "campaigns",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_user_campaign",
                table: "campaigns",
                column: "user_id",
                principalTable: "users",
                principalColumn: "user_id");
        }
    }
}
