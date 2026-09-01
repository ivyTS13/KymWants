using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KymWantsAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddResetPassV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "reset_password_token",
                table: "users",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "reset_password_token_expiry",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "reset_password_token",
                table: "users");

            migrationBuilder.DropColumn(
                name: "reset_password_token_expiry",
                table: "users");
        }
    }
}
