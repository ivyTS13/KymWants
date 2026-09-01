
using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IDishRepository
    {
        Task<Dish?> GetByIdAsync(Guid id);
        Task<Dish> CreateAsync(Dish dish, Guid collectionId);
        Task UpdateAsync(Dish dish);
        Task DeleteAsync(Guid id);
        Task<List<Dish>> GetByCollectionIdAsync(Guid collectionId);
    }
}
