

using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IDishService
    {
        Task<DishResponseDto?> GetByIdAsync(Guid id);
        Task<List<DishResponseDto>> GetByCollectionIdAsync(Guid collectionId);
        Task<DishResponseDto> CreateAsync(CreateDishDto dto, Guid userId);
        Task<DishResponseDto> UpdateAsync(Guid id, UpdateDishDto dto, Guid userId);
        Task DeleteAsync(Guid id, Guid userId);
    }
}
