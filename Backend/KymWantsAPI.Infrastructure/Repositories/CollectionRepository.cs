using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using KymWantsAPI.Infrastructure.KymContext;
using Microsoft.EntityFrameworkCore;

namespace KymWantsAPI.Infrastructure.Repositories
{
    public class CollectionRepository : ICollectionRepository
    {
        private readonly KymWantsDBContext _context;

        public CollectionRepository(KymWantsDBContext context)
        {
            _context = context;
        }

        public async Task<List<Collection>> GetAllSharedAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Collections
                .AsNoTracking()
                .AsSplitQuery()
                .Include(c => c.User)
                .Include(c => c.CollectionDishes)
                    .ThenInclude(cd => cd.Dish)
                        .ThenInclude(d => d.Category)
                .Where(c => c.IsShared)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Collection>> GetAllByUserAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.Collections
                .AsNoTracking()
                .AsSplitQuery()
                .Include(c => c.User)
                .Include(c => c.CollectionDishes)
                    .ThenInclude(cd => cd.Dish)
                        .ThenInclude(d => d.Category)
                .Where(c => c.UserId == userId)
                .ToListAsync(cancellationToken);
        }

        public async Task<Collection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Collections
                .AsSplitQuery()
                .Include(c => c.User)
                .Include(c => c.CollectionDishes)
                    .ThenInclude(cd => cd.Dish)
                        .ThenInclude(d => d.Category)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        }

        public async Task<Collection> CreateAsync(Collection collection, CancellationToken cancellationToken = default)
        {
            _context.Collections.Add(collection);
            await _context.SaveChangesAsync(cancellationToken);
            return collection;
        }

        public async Task UpdateAsync(Collection collection, CancellationToken cancellationToken = default)
        {
            _context.Collections.Update(collection);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            await _context.Collections
                .Where(c => c.Id == id)
                .ExecuteDeleteAsync(cancellationToken);
        }
    }
}
