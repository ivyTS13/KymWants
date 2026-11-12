using FluentValidation;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Exceptions;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using MapsterMapper;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Application.Services
{
    public class DishService : IDishService
    {
        private readonly IDishRepository _dishRepository;
        private readonly ICollectionRepository _collectionRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;
        private readonly IImageStorageService _imageStorageService;
        private readonly ILogger<DishService> _logger;
        private readonly ICacheService _cacheService;
        private readonly IValidator<CreateDishDto> _createValidator;
        private readonly IValidator<UpdateDishDto> _updateValidator;

        public DishService(
            IDishRepository dishRepository,
            ICollectionRepository collectionRepository,
            ICategoryRepository categoryRepository,
            ICacheService cacheService,
            IMapper mapper,
            IImageStorageService imageStorageService,
            ILogger<DishService> logger,
            IValidator<CreateDishDto> createValidator,
            IValidator<UpdateDishDto> updateValidator)
        {
            _dishRepository = dishRepository;
            _collectionRepository = collectionRepository;
            _categoryRepository = categoryRepository;
            _mapper = mapper;
            _cacheService = cacheService;
            _imageStorageService = imageStorageService;
            _logger = logger;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        public async Task<DishResponseDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var dish = await _dishRepository.GetByIdAsync(id, cancellationToken);
            if (dish == null)
            {
                throw new NotFoundException("Dish not found.");
            }

            return _mapper.Map<DishResponseDto>(dish);
        }

        public async Task<List<DishResponseDto>> GetByCollectionIdAsync(Guid collectionId, CancellationToken cancellationToken = default)
        {
            var dishes = await _dishRepository.GetByCollectionIdAsync(collectionId, cancellationToken);
            return _mapper.Map<List<DishResponseDto>>(dishes);
        }

        public async Task<DishResponseDto> CreateAsync(CreateDishDto dto, Guid userId, CancellationToken cancellationToken = default)
        {
            await _createValidator.ValidateAndThrowAsync(dto, cancellationToken);

            // Verify that the user owns the target collection
            var collection = await _collectionRepository.GetByIdAsync(dto.CollectionId, cancellationToken);
            if (collection == null)
            {
                throw new NotFoundException("Collection not found.");
            }

            if (collection.UserId != userId)
            {
                throw new ForbiddenException("You can only add dishes to your own collections.");
            }

            // Validate if category exists
            var categoryExists = await _categoryRepository.ExistsAsync(dto.CategoryId, cancellationToken);
            if (!categoryExists)
            {
                throw new NotFoundException($"Category with ID '{dto.CategoryId}' does not exist.");
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
                    tags: new List<string> { "dish", dto.CollectionId.ToString() },
                    cancellationToken: cancellationToken
                );
                dish.ProfileImageUrl = imageUrl;
            }

            var createdDish = await _dishRepository.CreateAsync(dish, dto.CollectionId, cancellationToken);

            var result = await _dishRepository.GetByIdAsync(createdDish.Id, cancellationToken);
            await _cacheService.InvalidateUserCacheAsync(userId, cancellationToken);
            return _mapper.Map<DishResponseDto>(result!);
        }

        public async Task<DishResponseDto> UpdateAsync(Guid id, UpdateDishDto dto, Guid userId, CancellationToken cancellationToken = default)
        {
            await _updateValidator.ValidateAndThrowAsync(dto, cancellationToken);

            var dish = await _dishRepository.GetByIdAsync(id, cancellationToken);
            if (dish == null)
            {
                throw new NotFoundException("Dish not found.");
            }

            if (dish.CreatedByUserId != userId)
            {
                throw new ForbiddenException("This is not your created dish");
            }

            var categoryExists = await _categoryRepository.ExistsAsync(dto.CategoryId, cancellationToken);
            if (!categoryExists)
            {
                throw new NotFoundException($"Category with ID '{dto.CategoryId}' does not exist.");
            }

            dish.Name = dto.Name;
            dish.Description = dto.Description;
            dish.CategoryId = dto.CategoryId;

            if (dto.ProfileImageUrl != null && dto.ProfileImageUrl.Length > 0)
            {
                var fileName = $"dish_{dish.Id}_{Guid.NewGuid()}{Path.GetExtension(dto.ProfileImageUrl.FileName)}";
                var imageUrl = await _imageStorageService.UploadImageAsync(
                    file: dto.ProfileImageUrl,
                    fileName: fileName,
                    folder: "/dishes",
                    tags: new List<string> { "dish", id.ToString() },
                    cancellationToken: cancellationToken
                );
                dish.ProfileImageUrl = imageUrl;
            }

            await _dishRepository.UpdateAsync(dish, cancellationToken);

            var updatedDish = await _dishRepository.GetByIdAsync(id, cancellationToken);
            await _cacheService.InvalidateUserCacheAsync(userId, cancellationToken);
            return _mapper.Map<DishResponseDto>(updatedDish!);
        }

        public async Task DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
        {
            var dish = await _dishRepository.GetByIdAsync(id, cancellationToken);
            if (dish == null)
            {
                throw new NotFoundException("Dish not found.");
            }

            if (dish.CreatedByUserId != userId)
            {
                throw new ForbiddenException("This is not your created dish");
            }

            await _dishRepository.DeleteAsync(id, cancellationToken);
            await _cacheService.InvalidateUserCacheAsync(userId, cancellationToken);
        }
    }
}
