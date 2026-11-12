using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IAuthService
    {
        Task<UserReadDto> RegisterAsync(UserCreateDto dto, CancellationToken cancellationToken = default);
        Task<string> LoginAsync(UserLoginDto dto, CancellationToken cancellationToken = default);
        Task<string> GoogleLoginAsync(string email, string name, string googleId, string? profileImageUrl, CancellationToken cancellationToken = default);
        Task<UserReadDto> MeAsync(string email, CancellationToken cancellationToken = default);
        Task ChangePasswordAsync(string email, ChangePasswordDto dto, CancellationToken cancellationToken = default);
        Task ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken cancellationToken = default);
        Task ResetPasswordAsync(ResetPasswordDto dto, CancellationToken cancellationToken = default);
    }
}
