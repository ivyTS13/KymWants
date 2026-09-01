

using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using KymWantsAPI.Infrastructure.KymContext;
using Microsoft.EntityFrameworkCore;

namespace KymWantsAPI.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly KymWantsDBContext _context;

        public CategoryRepository(KymWantsDBContext context)
        {
            _context = context;
        }
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Categories
                .AnyAsync(c => c.Id == id);
        }
        public async Task<List<Category>> GetAllAsync()
        {
            return await _context.Categories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .ToListAsync();
        }
    }
}
