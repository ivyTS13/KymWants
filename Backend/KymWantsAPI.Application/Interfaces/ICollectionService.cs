

using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Interfaces
{
    public interface ICollectionService
    {
        Task<List<CollectionResponseDto>> GetAllSharedAsync();
        Task<List<CollectionResponseDto>> GetMyCollectionsAsync(Guid userId);
        Task<CollectionResponseDto?> GetByIdAsync(Guid id, Guid currentUserId);
        Task<CollectionResponseDto> CreateAsync(CreateCollectionDto dto, Guid userId);
        Task<CollectionResponseDto> UpdateAsync(Guid id, UpdateCollectionDto dto, Guid userId);
        Task DeleteAsync(Guid id, Guid userId);
    }
}
