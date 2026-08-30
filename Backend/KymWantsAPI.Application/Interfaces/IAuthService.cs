
using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IAuthService
    {
        Task<UserReadDto> RegisterAsync(UserCreateDto dto);
        Task<string> LoginAsync(UserLoginDto dto);
        Task<string> GoogleLoginAsync(string email, string name, string googleId, string? profileImageUrl);
        Task<UserReadDto> MeAsync(string email);
    }
}
