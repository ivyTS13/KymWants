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

        public async Task<List<Collection>> GetAllSharedAsync()
        {
            return await _context.Collections
                .AsNoTracking()
                .Include(c => c.User)
                .Include(c => c.CollectionDishes)
                    .ThenInclude(cd => cd.Dish)
                        .ThenInclude(d => d.Category)
                .Where(c => c.IsShared)
                .ToListAsync();
        }

        public async Task<List<Collection>> GetAllByUserAsync(Guid userId)
        {
            return await _context.Collections
                .AsNoTracking()
                .Include(c => c.User)
                .Include(c => c.CollectionDishes)
                    .ThenInclude(cd => cd.Dish)
                        .ThenInclude(d => d.Category)
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }

        public async Task<Collection?> GetByIdAsync(Guid id)
        {
            return await _context.Collections
                .Include(c => c.User)
                .Include(c => c.CollectionDishes)
                    .ThenInclude(cd => cd.Dish)
                        .ThenInclude(d => d.Category)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Collection> CreateAsync(Collection collection)
        {
            _context.Collections.Add(collection);
            await _context.SaveChangesAsync();
            return collection;
        }

        public async Task UpdateAsync(Collection collection)
        {
            _context.Collections.Update(collection);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var collection = await _context.Collections.FindAsync(id);
            if (collection != null)
            {
                _context.Collections.Remove(collection);
                await _context.SaveChangesAsync();
            }
        }
    }
}