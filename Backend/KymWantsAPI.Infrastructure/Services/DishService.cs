using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using MapsterMapper;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Infrastructure.Services
{
    public class DishService : IDishService
    {
        private readonly IDishRepository _dishRepository;
        private readonly ICollectionRepository _collectionRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;
        private readonly IImageStorageService _imageStorageService;
        private readonly ILogger<DishService> _logger;

        public DishService(
            IDishRepository dishRepository,
            ICollectionRepository collectionRepository,
            ICategoryRepository categoryRepository,
            IMapper mapper,
            IImageStorageService imageStorageService,
            ILogger<DishService> logger)
        {
            _dishRepository = dishRepository;
            _collectionRepository = collectionRepository;
            _categoryRepository = categoryRepository;
            _mapper = mapper;
            _imageStorageService = imageStorageService;
            _logger = logger;
        }

        public async Task<DishResponseDto?> GetByIdAsync(Guid id)
        {
            var dish = await _dishRepository.GetByIdAsync(id);
            return dish == null ? null : _mapper.Map<DishResponseDto>(dish);
        }

        public async Task<List<DishResponseDto>> GetByCollectionIdAsync(Guid collectionId)
        {
            var dishes = await _dishRepository.GetByCollectionIdAsync(collectionId);
            return _mapper.Map<List<DishResponseDto>>(dishes);
        }

        public async Task<DishResponseDto> CreateAsync(CreateDishDto dto, Guid userId)
        {
            // Verify that the user owns the target collection
            var collection = await _collectionRepository.GetByIdAsync(dto.CollectionId);
            if (collection == null)
            {
                throw new KeyNotFoundException("Collection not found.");
            }

            if (collection.UserId != userId)
            {
                throw new UnauthorizedAccessException("You can only add dishes to your own collections.");
            }
            // Validate if category exists
            var categoryExists = await _categoryRepository.ExistsAsync(dto.CategoryId);
            if (!categoryExists)
            {
                throw new KeyNotFoundException($"Category with ID '{dto.CategoryId}' does not exist.");
            }
            _logger.LogInformation("Creating dish '{Name}' under Collection ID {CollectionId}", dto.Name, dto.CollectionId);

            var dish = _mapper.Map<Dish>(dto);
            dish.CreatedByUserId = userId;

            // Handle image upload if provided
            if (dto.ProfileImageUrl != null && dto.ProfileImageUrl.Length > 0)
            {
                var fileName = $"dish_{Guid.NewGuid()}{Path.GetExtension(dto.ProfileImageUrl.FileName)}";
                var imageUrl = await _imageStorageService.UploadImageAsync(
                    file: dto.ProfileImageUrl,
                    fileName: fileName,
                    folder: "/dishes",
                    tags: new List<string> { "dish", dto.CollectionId.ToString() }
                );
                dish.ProfileImageUrl = imageUrl;
            }
            var createdDish = await _dishRepository.CreateAsync(dish, dto.CollectionId);

            // Re-fetch to load navigation properties like Category
            var result = await _dishRepository.GetByIdAsync(createdDish.Id);
            return _mapper.Map<DishResponseDto>(result!);
        }

        public async Task<DishResponseDto> UpdateAsync(Guid id, UpdateDishDto dto, Guid userId)
        {
            var dish = await _dishRepository.GetByIdAsync(id);
            if (dish == null)
            {
                throw new KeyNotFoundException("Dish not found.");
            }

            dish.Name = dto.Name;
            dish.Description = dto.Description;
            dish.CategoryId = dto.CategoryId;
            // Upload and update image if a new file is uploaded
            if (dto.ProfileImageUrl != null && dto.ProfileImageUrl.Length > 0)
            {
                var fileName = $"dish_{dish.Id}_{Guid.NewGuid()}{Path.GetExtension(dto.ProfileImageUrl.FileName)}";
                var imageUrl = await _imageStorageService.UploadImageAsync(
                    file: dto.ProfileImageUrl,
                    fileName: fileName,
                    folder: "/dishes",
                    tags: new List<string> { "dish", id.ToString() }
                );
                dish.ProfileImageUrl = imageUrl;
            }

            await _dishRepository.UpdateAsync(dish);

            var updatedDish = await _dishRepository.GetByIdAsync(id);
            return _mapper.Map<DishResponseDto>(updatedDish!);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var dish = await _dishRepository.GetByIdAsync(id);
            if (dish == null)
            {
                throw new KeyNotFoundException("Dish not found.");
            }

            await _dishRepository.DeleteAsync(id);
        }
    }
}