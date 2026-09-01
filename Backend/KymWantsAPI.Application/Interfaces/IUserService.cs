

using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IUserService
    {
        Task<UserReadDto> UpdateProfileAsync(string email, UserUpdateDto dto);
    }
}