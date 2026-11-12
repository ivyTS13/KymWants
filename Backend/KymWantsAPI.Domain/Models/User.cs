using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KymWantsAPI.Domain.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Column("email")]
        [StringLength(320)]
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Column("name", TypeName = "character varying")]
        [Required]
        [StringLength(100)] // Good practice to limit standard string columns
        public string DisplayName { get; set; } = string.Empty;

        [Column("google_provider_id")]
        [StringLength(255)]
        public string? GoogleProviderId { get; set; }

        [Column("hashed_password")]
        [StringLength(1024)]
        public string? HashedPassword { get; set; }

        [Column("profile_image_url", TypeName = "character varying")]
        [Url] 
        public string? ProfileImageUrl { get; set; }
        [Column("is_superuser")]
        public bool IsSuperUser { get; set; } = false;
        [Column("created_at")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("reset_password_token")]
        [StringLength(255)]
        public string? ResetPasswordToken { get; set; }

        [Column("reset_password_token_expiry")]
        public DateTime? ResetPasswordTokenExpiry { get; set; }

        [InverseProperty("User")]
        public ICollection<Collection> Collections { get; set; } = new List<Collection>();
    }
}