using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default);
        Task<User> CreateAsync(User user, CancellationToken cancellationToken = default);
        Task UpdateAsync(User user, CancellationToken cancellationToken = default);
        Task<User?> GetByResetTokenAsync(string token, CancellationToken cancellationToken = default);
    }
}
