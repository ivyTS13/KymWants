using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using KymWantsAPI.Infrastructure.KymContext;
using Microsoft.EntityFrameworkCore;

namespace KymWantsAPI.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly KymWantsDBContext _context;

        public UserRepository(KymWantsDBContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        public async Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default) =>
            await _context.Users.FirstOrDefaultAsync(u => u.GoogleProviderId == googleId, cancellationToken);

        public async Task<User> CreateAsync(User user, CancellationToken cancellationToken = default)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
            return user;
        }

        public async Task<User?> GetByResetTokenAsync(string token, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.ResetPasswordToken == token, cancellationToken);
        }

        public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
