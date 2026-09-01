
using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync();
        Task<bool> ExistsAsync(int id);
    }
}
