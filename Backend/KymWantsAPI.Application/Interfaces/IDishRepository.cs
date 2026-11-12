using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IDishRepository
    {
        Task<Dish?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Dish> CreateAsync(Dish dish, Guid collectionId, CancellationToken cancellationToken = default);
        Task UpdateAsync(Dish dish, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<Dish>> GetByCollectionIdAsync(Guid collectionId, CancellationToken cancellationToken = default);
    }
}
