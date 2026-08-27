

namespace KymWantsAPI.Application.DTOs
{
   public record CollectionResponseDto(
       Guid Id,
       string Name,
       bool IsShared,
       Guid UserName
       );

    public record CreateCollectionDto(
    string Name,
    bool? IsShared,
    List<Guid>? DishIds
);
}
