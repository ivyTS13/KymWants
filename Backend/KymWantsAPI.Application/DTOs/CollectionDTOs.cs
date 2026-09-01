

namespace KymWantsAPI.Application.DTOs
{
   public record CollectionResponseDto(
       Guid Id,
       string Name,
       bool IsShared,
       string UserName,
       List<DishResponseDto> Dishes
       );

    public record CreateCollectionDto(
    string Name,
    bool? IsShared
       );

    public record UpdateCollectionDto(
    string Name,
    bool? IsShared
       );
}
