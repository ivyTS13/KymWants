
using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IAuthService
    {
        Task<UserReadDto> RegisterAsync(UserCreateDto dto);
        Task<string> LoginAsync(UserLoginDto dto);
        Task<string> GoogleLoginAsync(string email, string name, string googleId, string? profileImageUrl);
        Task<UserReadDto> MeAsync(string email);
        Task ChangePasswordAsync(string email, ChangePasswordDto dto);
        Task ForgotPasswordAsync(ForgotPasswordDto dto);
        Task ResetPasswordAsync(ResetPasswordDto dto);
    }
}
