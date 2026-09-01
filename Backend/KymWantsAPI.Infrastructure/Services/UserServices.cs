

using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IImageStorageService _imageStorageService;
        private readonly IMapper _mapper;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserRepository userRepository,
            IImageStorageService imageStorageService,
            IMapper mapper,
            ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _imageStorageService = imageStorageService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<UserReadDto> UpdateProfileAsync(string email, UserUpdateDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            // 1. Map standard text fields (e.g., DisplayName) to the user entity
            dto.Adapt(user);

            // 2. Handle image upload if a file was provided
            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                var fileName = $"user_{user.Id}_{Guid.NewGuid()}{Path.GetExtension(dto.ProfileImage.FileName)}";
                _logger.LogInformation("Uploading new profile image for user {UserId}", user.Id);

                var imageUrl = await _imageStorageService.UploadImageAsync(
                    file: dto.ProfileImage,
                    fileName: fileName,
                    folder: "/avatars",
                    tags: new List<string> { "avatar", user.Id.ToString() }
                );

                // Assign the returned ImageKit URL to the user profile
                user.ProfileImageUrl = imageUrl;
            }

            // 3. Save changes
            await _userRepository.UpdateAsync(user);

            return _mapper.Map<UserReadDto>(user);
        }
    }
}