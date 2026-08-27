

namespace KymWantsAPI.Application.DTOs
{
   public record DishResponseDto(
       Guid Id,
       string Name,
       string? Description,
       string CategoryName,
       string? ProfileImageUrl
       );
}
