

namespace KymWantsAPI.Application.DTOs
{
    public record UserReadDto(
      Guid Id,
      string Email,
      string? DisplayName,
      string? ProfileImageUrl
  );


    public record UserCreateDto(
        string Email,
        string Password,
        string? DisplayName
    );


    public record UserUpdateDto(
        string DisplayName,
        string? ProfileImageUrl
    );

    public record UserLoginDto(
        string Email,
        string Password);
}

