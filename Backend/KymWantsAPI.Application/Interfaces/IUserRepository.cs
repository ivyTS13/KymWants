

using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByGoogleIdAsync(string googleId);
        Task<User> CreateAsync(User user);
        Task UpdateAsync(User user);
        Task<User?> GetByResetTokenAsync(string token);
    }
}