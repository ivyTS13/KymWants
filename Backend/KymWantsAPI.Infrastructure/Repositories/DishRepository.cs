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

        public async Task<Dish?> GetByIdAsync(Guid id)
        {
            return await _context.Dishes
                .Include(d => d.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<List<Dish>> GetByCollectionIdAsync(Guid collectionId)
        {
            return await _context.Dishes
                .Where(d => d.CollectionDishes.Any(cd => cd.CollectionId == collectionId))
                .Include(d => d.Category)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Dish> CreateAsync(Dish dish, Guid collectionId)
        {
            _context.Dishes.Add(dish);

            // Link to collection via junction table
            var collectionDish = new CollectionDish
            {
                CollectionId = collectionId,
                DishId = dish.Id
            };
            _context.CollectionDishes.Add(collectionDish);

            await _context.SaveChangesAsync();
            return dish;
        }

        public async Task UpdateAsync(Dish dish)
        {
            _context.Dishes.Update(dish);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var dish = await _context.Dishes.FindAsync(id);
            if (dish != null)
            {
                _context.Dishes.Remove(dish);
                await _context.SaveChangesAsync();
            }
        }
    }
}