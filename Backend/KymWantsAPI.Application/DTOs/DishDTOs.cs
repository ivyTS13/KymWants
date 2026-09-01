

using Microsoft.AspNetCore.Http;

namespace KymWantsAPI.Application.DTOs
{
    public record DishResponseDto(
         Guid Id,
         string Name,
         string? Description,
         string CategoryName,
         string? ProfileImageUrl
     );

    public record CreateDishDto(
        string Name,
        string? Description,
        int CategoryId,
        Guid CollectionId,
        IFormFile? ProfileImageUrl
    );

    public record UpdateDishDto(
        string Name,
        string? Description,
        int CategoryId,
        IFormFile? ProfileImageUrl
    );
}


