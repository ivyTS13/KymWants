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

        public CollectionService(
            ICollectionRepository collectionRepository,
            IMapper mapper,
            ILogger<CollectionService> logger)
        {
            _collectionRepository = collectionRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<CollectionResponseDto>> GetAllSharedAsync()
        {
            var collections = await _collectionRepository.GetAllSharedAsync();
            return _mapper.Map<List<CollectionResponseDto>>(collections);
        }

        public async Task<List<CollectionResponseDto>> GetMyCollectionsAsync(Guid userId)
        {
            var collections = await _collectionRepository.GetAllByUserAsync(userId);
            return _mapper.Map<List<CollectionResponseDto>>(collections);
        }

        public async Task<CollectionResponseDto?> GetByIdAsync(Guid id, Guid currentUserId)
        {
            var collection = await _collectionRepository.GetByIdAsync(id);
            if (collection == null) return null;

            // Only allow viewing if it is shared OR owned by the current user
            if (!collection.IsShared && collection.UserId != currentUserId)
            {
                throw new UnauthorizedAccessException("You do not have permission to view this collection.");
            }

            return _mapper.Map<CollectionResponseDto>(collection);
        }

        public async Task<CollectionResponseDto> CreateAsync(CreateCollectionDto dto, Guid userId)
        {
            _logger.LogInformation("Creating collection '{Name}' for user ID {UserId}", dto.Name, userId);

            var collection = _mapper.Map<Collection>(dto);
            collection.UserId = userId;

            var created = await _collectionRepository.CreateAsync(collection);

            // Re-fetch with includes (User, Dishes) for mapping response properly
            var result = await _collectionRepository.GetByIdAsync(created.Id);
            return _mapper.Map<CollectionResponseDto>(result!);
        }

        public async Task<CollectionResponseDto> UpdateAsync(Guid id, UpdateCollectionDto dto, Guid userId)
        {
            var collection = await _collectionRepository.GetByIdAsync(id);
            if (collection == null)
            {
                throw new KeyNotFoundException("Collection not found.");
            }

            if (collection.UserId != userId)
            {
                throw new UnauthorizedAccessException("You can only edit your own collections.");
            }

            collection.Name = dto.Name;
            if (dto.IsShared.HasValue)
            {
                collection.IsShared = dto.IsShared.Value;
            }

            await _collectionRepository.UpdateAsync(collection);
            return _mapper.Map<CollectionResponseDto>(collection);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var collection = await _collectionRepository.GetByIdAsync(id);
            if (collection == null)
            {
                throw new KeyNotFoundException("Collection not found.");
            }

            if (collection.UserId != userId)
            {
                throw new UnauthorizedAccessException("You can only delete your own collections.");
            }

            await _collectionRepository.DeleteAsync(id);
        }
    }
}