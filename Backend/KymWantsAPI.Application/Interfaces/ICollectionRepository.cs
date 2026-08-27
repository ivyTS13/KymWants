using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface ICollectionRepository
    {
        Task<List<Collection>> GetAllSharedAsync();
        Task<Collection?> GetByIdAsync(Guid id);
        Task<Collection> CreateAsync(Collection collection, List<Guid> dishIds);
        Task UpdateAsync(Collection collection, List<Guid> dishIds);
        Task DeleteAsync(Guid id);
        Task<List<Collection>> GetAllByUserAsync(Guid userId);
    }
}
