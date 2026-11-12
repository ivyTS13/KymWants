using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KymWantsAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSuperUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_superuser",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_superuser",
                table: "users");
        }
    }
}
