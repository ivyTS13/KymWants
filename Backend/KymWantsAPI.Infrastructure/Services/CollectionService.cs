using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using MapsterMapper;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Infrastructure.Services
{
    public class CollectionService : ICollectionService
    {
        private readonly ICollectionRepository _collectionRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<CollectionService> _logger;
        private readonly ICacheService _cacheService;

        public CollectionService(
            ICollectionRepository collectionRepository,
            IMapper mapper,
            ICacheService cacheService,
            ILogger<CollectionService> logger)
        {
            _collectionRepository = collectionRepository;
            _cacheService = cacheService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<CollectionResponseDto>> GetAllSharedAsync()
        {
            try
            {
                var collections = await _collectionRepository.GetAllSharedAsync();
                return _mapper.Map<List<CollectionResponseDto>>(collections);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all shared collections.");
                throw;
            }
        }

        public async Task<List<CollectionResponseDto>> GetMyCollectionsAsync(Guid userId)
        {
            string cacheKey = $"collection_{userId}";

            try
            {
                // Attempt to fetch from cache
                try
                {
                    var cachedCollections = await _cacheService.GetAsync<List<CollectionResponseDto>>(cacheKey);
                    if (cachedCollections != null)
                    {
                        return cachedCollections;
                    }
                }
                catch (Exception ex)
                {
                    // Log cache failure, but proceed to query DB instead of failing the request
                    _logger.LogWarning(ex, "Failed to retrieve cache for key '{CacheKey}'. Falling back to database.", cacheKey);
                }

                var collections = await _collectionRepository.GetAllByUserAsync(userId);
                var response = _mapper.Map<List<CollectionResponseDto>>(collections);
                // Attempt to update cache
                try
                {
                    await _cacheService.SetAsync(cacheKey, response, absoluteExpireTime: TimeSpan.FromHours(2));
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to set cache for key '{CacheKey}'.", cacheKey);
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching collections for User ID {UserId}.", userId);
                throw;
            }
        }

        public async Task<CollectionResponseDto?> GetByIdAsync(Guid id, Guid currentUserId)
        {
            try
            {
                var collection = await _collectionRepository.GetByIdAsync(id);
                if (collection == null) return null;

                // Only allow viewing if it is shared OR owned by the current user
                if (!collection.IsShared && collection.UserId != currentUserId)
                {
                    _logger.LogWarning("User ID {UserId} attempted unauthorized access to Collection ID {CollectionId}.", currentUserId, id);
                    throw new UnauthorizedAccessException("You do not have permission to view this collection.");
                }

                return _mapper.Map<CollectionResponseDto>(collection);
            }
            catch (Exception ex) when (ex is not UnauthorizedAccessException)
            {
                _logger.LogError(ex, "An error occurred while retrieving Collection ID {CollectionId}.", id);
                throw;
            }
        }

        public async Task<CollectionResponseDto> CreateAsync(CreateCollectionDto dto, Guid userId)
        {
            try
            {
                _logger.LogInformation("Creating collection '{Name}' for user ID {UserId}", dto.Name, userId);

                var collection = _mapper.Map<Collection>(dto);
                collection.UserId = userId;

                var created = await _collectionRepository.CreateAsync(collection);

                // Re-fetch with includes (User, Dishes) for mapping response properly
                var result = await _collectionRepository.GetByIdAsync(created.Id);

                // Invalidate user collection cache upon creation
                await _cacheService.InvalidateUserCacheAsync(userId);

                return _mapper.Map<CollectionResponseDto>(result!);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating collection '{Name}' for User ID {UserId}.", dto.Name, userId);
                throw;
            }
        }

        public async Task<CollectionResponseDto> UpdateAsync(Guid id, UpdateCollectionDto dto, Guid userId)
        {
            try
            {
                var collection = await _collectionRepository.GetByIdAsync(id);
                if (collection == null)
                {
                    throw new KeyNotFoundException("Collection not found.");
                }

                if (collection.UserId != userId)
                {
                    _logger.LogWarning("User ID {UserId} attempted to update unauthorized Collection ID {CollectionId}.", userId, id);
                    throw new UnauthorizedAccessException("You can only edit your own collections.");
                }

                collection.Name = dto.Name;
                if (dto.IsShared.HasValue)
                {
                    collection.IsShared = dto.IsShared.Value;
                }

                await _collectionRepository.UpdateAsync(collection);

                // Invalidate user collection cache upon mutation
                await _cacheService.InvalidateUserCacheAsync(userId);

                return _mapper.Map<CollectionResponseDto>(collection);
            }
            catch (Exception ex) when (ex is not KeyNotFoundException && ex is not UnauthorizedAccessException)
            {
                _logger.LogError(ex, "An error occurred while updating Collection ID {CollectionId} for User ID {UserId}.", id, userId);
                throw;
            }
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            try
            {
                var collection = await _collectionRepository.GetByIdAsync(id);
                if (collection == null)
                {
                    throw new KeyNotFoundException("Collection not found.");
                }

                if (collection.UserId != userId)
                {
                    _logger.LogWarning("User ID {UserId} attempted to delete unauthorized Collection ID {CollectionId}.", userId, id);
                    throw new UnauthorizedAccessException("You can only delete your own collections.");
                }

                await _collectionRepository.DeleteAsync(id);

                // Invalidate user collection cache upon deletion
                await _cacheService.InvalidateUserCacheAsync(userId);
            }
            catch (Exception ex) when (ex is not KeyNotFoundException && ex is not UnauthorizedAccessException)
            {
                _logger.LogError(ex, "An error occurred while deleting Collection ID {CollectionId} for User ID {UserId}.", id, userId);
                throw;
            }
        }

       
    }
}