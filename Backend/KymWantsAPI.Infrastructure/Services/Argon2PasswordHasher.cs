using Isopoh.Cryptography.Argon2;
using KymWantsAPI.Application.Interfaces;

namespace KymWantsAPI.Infrastructure.Services
{
    public class Argon2PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password) => Argon2.Hash(password);

        public bool VerifyPassword(string hashedPassword, string providedPassword) =>
            Argon2.Verify(hashedPassword, providedPassword);
    }
}
