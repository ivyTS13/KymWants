using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using KymWantsAPI.Infrastructure.KymContext;
using Microsoft.EntityFrameworkCore;

namespace KymWantsAPI.Infrastructure.Repositories
{
    public class DishRepository : IDishRepository
    {
        private readonly KymWantsDBContext _context;

        public DishRepository(KymWantsDBContext context)
        {
            _context = context;
        }

        public async Task<Dish?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.Dishes
                .Include(d => d.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
        }

        public async Task<List<Dish>> GetByCollectionIdAsync(Guid collectionId, CancellationToken cancellationToken = default)
        {
            return await _context.Dishes
                .Where(d => d.CollectionDishes.Any(cd => cd.CollectionId == collectionId))
                .Include(d => d.Category)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<Dish> CreateAsync(Dish dish, Guid collectionId, CancellationToken cancellationToken = default)
        {
            _context.Dishes.Add(dish);

            // Link to collection via junction table
            var collectionDish = new CollectionDish
            {
                CollectionId = collectionId,
                DishId = dish.Id
            };
            _context.CollectionDishes.Add(collectionDish);

            await _context.SaveChangesAsync(cancellationToken);
            return dish;
        }

        public async Task UpdateAsync(Dish dish, CancellationToken cancellationToken = default)
        {
            _context.Dishes.Update(dish);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            await _context.Dishes
                .Where(d => d.Id == id)
                .ExecuteDeleteAsync(cancellationToken);
        }
    }
}
