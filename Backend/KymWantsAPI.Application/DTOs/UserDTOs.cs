

using Microsoft.AspNetCore.Http;

namespace KymWantsAPI.Application.DTOs
{
    public record UserReadDto(
      Guid Id,
      string Email,
      string? DisplayName,
      string? ProfileImageUrl,
      bool IsSuperUser
  );


    public record UserCreateDto(
        string Email,
        string Password,
        string? DisplayName
    );


    public record UserUpdateDto(
        string DisplayName,
        IFormFile? ProfileImage
    );

    public record UserLoginDto(
        string Email,
        string Password);

    public record ChangePasswordDto(
    string OldPassword,
    string NewPassword
);

    public record ForgotPasswordDto(
        string Email
    );

    public record ResetPasswordDto(
        string Token,
        string NewPassword
    );
}

