using FluentValidation;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Exceptions;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using MapsterMapper;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Application.Services
{
    public class CollectionService : ICollectionService
    {
        private readonly ICollectionRepository _collectionRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<CollectionService> _logger;
        private readonly ICacheService _cacheService;
        private readonly IValidator<CreateCollectionDto> _createValidator;
        private readonly IValidator<UpdateCollectionDto> _updateValidator;

        public CollectionService(
            ICollectionRepository collectionRepository,
            IMapper mapper,
            ICacheService cacheService,
            ILogger<CollectionService> logger,
            IValidator<CreateCollectionDto> createValidator,
            IValidator<UpdateCollectionDto> updateValidator)
        {
            _collectionRepository = collectionRepository;
            _cacheService = cacheService;
            _mapper = mapper;
            _logger = logger;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        public async Task<List<CollectionResponseDto>> GetAllSharedAsync(CancellationToken cancellationToken = default)
        {
            var collections = await _collectionRepository.GetAllSharedAsync(cancellationToken);
            return _mapper.Map<List<CollectionResponseDto>>(collections);
        }

        public async Task<List<CollectionResponseDto>> GetMyCollectionsAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            string cacheKey = $"collection_{userId}";

            try
            {
                var cachedCollections = await _cacheService.GetAsync<List<CollectionResponseDto>>(cacheKey, cancellationToken);
                if (cachedCollections != null)
                {
                    return cachedCollections;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to retrieve cache for key '{CacheKey}'. Falling back to database.", cacheKey);
            }

            var collections = await _collectionRepository.GetAllByUserAsync(userId, cancellationToken);
            var response = _mapper.Map<List<CollectionResponseDto>>(collections);

            try
            {
                await _cacheService.SetAsync(cacheKey, response, absoluteExpireTime: TimeSpan.FromHours(2), cancellationToken: cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to set cache for key '{CacheKey}'.", cacheKey);
            }

            return response;
        }

        public async Task<CollectionResponseDto> GetByIdAsync(Guid id, Guid currentUserId, CancellationToken cancellationToken = default)
        {
            var collection = await _collectionRepository.GetByIdAsync(id, cancellationToken);
            if (collection == null)
            {
                throw new NotFoundException("Collection not found.");
            }

            // Only allow viewing if it is shared OR owned by the current user
            if (!collection.IsShared && collection.UserId != currentUserId)
            {
                _logger.LogWarning("User ID {UserId} attempted unauthorized access to Collection ID {CollectionId}.", currentUserId, id);
                throw new ForbiddenException("You do not have permission to view this collection.");
            }

            return _mapper.Map<CollectionResponseDto>(collection);
        }

        public async Task<CollectionResponseDto> CreateAsync(CreateCollectionDto dto, Guid userId, CancellationToken cancellationToken = default)
        {
            await _createValidator.ValidateAndThrowAsync(dto, cancellationToken);

            _logger.LogInformation("Creating collection '{Name}' for user ID {UserId}", dto.Name, userId);

            var collection = _mapper.Map<Collection>(dto);
            collection.UserId = userId;

            var created = await _collectionRepository.CreateAsync(collection, cancellationToken);

            var result = await _collectionRepository.GetByIdAsync(created.Id, cancellationToken);
            await _cacheService.InvalidateUserCacheAsync(userId, cancellationToken);

            return _mapper.Map<CollectionResponseDto>(result!);
        }

        public async Task<CollectionResponseDto> UpdateAsync(Guid id, UpdateCollectionDto dto, Guid userId, CancellationToken cancellationToken = default)
        {
            await _updateValidator.ValidateAndThrowAsync(dto, cancellationToken);

            var collection = await _collectionRepository.GetByIdAsync(id, cancellationToken);
            if (collection == null)
            {
                throw new NotFoundException("Collection not found.");
            }

            if (collection.UserId != userId)
            {
                _logger.LogWarning("User ID {UserId} attempted to update unauthorized Collection ID {CollectionId}.", userId, id);
                throw new ForbiddenException("You can only edit your own collections.");
            }

            collection.Name = dto.Name;
            if (dto.IsShared.HasValue)
            {
                collection.IsShared = dto.IsShared.Value;
            }

            await _collectionRepository.UpdateAsync(collection, cancellationToken);
            await _cacheService.InvalidateUserCacheAsync(userId, cancellationToken);

            return _mapper.Map<CollectionResponseDto>(collection);
        }

        public async Task DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
        {
            var collection = await _collectionRepository.GetByIdAsync(id, cancellationToken);
            if (collection == null)
            {
                throw new NotFoundException("Collection not found.");
            }

            if (collection.UserId != userId)
            {
                _logger.LogWarning("User ID {UserId} attempted to delete unauthorized Collection ID {CollectionId}.", userId, id);
                throw new ForbiddenException("You can only delete your own collections.");
            }

            await _collectionRepository.DeleteAsync(id, cancellationToken);
            await _cacheService.InvalidateUserCacheAsync(userId, cancellationToken);
        }
    }
}
