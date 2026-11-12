using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface ICollectionRepository
    {
        Task<List<Collection>> GetAllSharedAsync(CancellationToken cancellationToken = default);
        Task<Collection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Collection> CreateAsync(Collection collection, CancellationToken cancellationToken = default);
        Task UpdateAsync(Collection collection, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<Collection>> GetAllByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
