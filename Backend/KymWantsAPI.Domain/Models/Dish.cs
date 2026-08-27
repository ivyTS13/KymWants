using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KymWantsAPI.Domain.Models
{
    [Table("dishes")]
    public class Dish
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("name", TypeName = "character varying")]
        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        [StringLength(1000)]
        public string? Description { get; set; }

        [Column("category_id")]
        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        [InverseProperty("Dishes")]
        public Category Category { get; set; } = null!;

        [Column("dish_image_url", TypeName = "character varying")]
        [Url]
        [StringLength(2048)]
        public string? ProfileImageUrl { get; set; }

        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [ForeignKey("CreatedByUserId")]
        public User CreatedByUser { get; set; } = null!;

        [InverseProperty("Dish")]
        public ICollection<CollectionDish> CollectionDishes { get; set; } = new List<CollectionDish>();
    }
}