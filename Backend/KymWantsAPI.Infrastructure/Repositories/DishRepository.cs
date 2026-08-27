using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Infrastructure.Repositories
{
    public class DishRepository : IDishRepository
    {
        public Task<Dish> CreateAsync(Dish dish)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<List<Dish>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Dish?> GetByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateAsync(Dish dish)
        {
            throw new NotImplementedException();
        }
    }
}
