using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Infrastructure.Repositories
{
    public class CollectionRepository : ICollectionRepository
    {
        public Task<Collection> CreateAsync(Collection collection, List<Guid> dishIds)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<List<Collection>> GetAllByUserAsync(Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Collection>> GetAllSharedAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Collection?> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateAsync(Collection collection, List<Guid> dishIds)
        {
            throw new NotImplementedException();
        }
    }
}
