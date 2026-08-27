
using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IDishRepository
    {
        Task<List<Dish>> GetAllAsync();
        Task<Dish?> GetByIdAsync(Guid id);
        Task<Dish> CreateAsync(Dish dish);
        Task UpdateAsync(Dish dish);
        Task DeleteAsync(Guid id);
    }
}
