using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KymWantsAPI.Domain.Models
{
    [Table("collection_dishes")]
    public class CollectionDish
    {
        [Column("collection_id")]
        public Guid CollectionId { get; set; }

        [ForeignKey("CollectionId")]
        [InverseProperty("CollectionDishes")]
        public Collection Collection { get; set; } = null!;

        [Column("dish_id")]
        public Guid DishId { get; set; }

        [ForeignKey("DishId")]
        [InverseProperty("CollectionDishes")]
        public Dish Dish { get; set; } = null!;
    }
}