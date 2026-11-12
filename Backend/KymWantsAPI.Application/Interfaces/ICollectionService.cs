using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Interfaces
{
    public interface ICollectionService
    {
        Task<List<CollectionResponseDto>> GetAllSharedAsync(CancellationToken cancellationToken = default);
        Task<List<CollectionResponseDto>> GetMyCollectionsAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<CollectionResponseDto> GetByIdAsync(Guid id, Guid currentUserId, CancellationToken cancellationToken = default);
        Task<CollectionResponseDto> CreateAsync(CreateCollectionDto dto, Guid userId, CancellationToken cancellationToken = default);
        Task<CollectionResponseDto> UpdateAsync(Guid id, UpdateCollectionDto dto, Guid userId, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    }
}
