using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IDishService
    {
        Task<DishResponseDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<DishResponseDto>> GetByCollectionIdAsync(Guid collectionId, CancellationToken cancellationToken = default);
        Task<DishResponseDto> CreateAsync(CreateDishDto dto, Guid userId, CancellationToken cancellationToken = default);
        Task<DishResponseDto> UpdateAsync(Guid id, UpdateDishDto dto, Guid userId, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    }
}
