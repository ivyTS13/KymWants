using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KymWantsAPI.Domain.Models
{
    [Table("collections")]
    public class Collection
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("name", TypeName = "character varying")]
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column("is_shared")]
        public bool IsShared { get; set; } = false;

        [Column("user_id")]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        [InverseProperty("Collections")]
        public User User { get; set; } = null!;

        [InverseProperty("Collection")]
        public ICollection<CollectionDish> CollectionDishes { get; set; } = new List<CollectionDish>();
    }
}