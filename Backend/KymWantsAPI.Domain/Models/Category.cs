using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KymWantsAPI.Domain.Models
{
    [Table("categories")]
    public class Category
    {
        [Key]
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Column("name", TypeName = "character varying")]
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [InverseProperty("Category")]
        public ICollection<Dish> Dishes { get; set; } = new List<Dish>();
    }
}