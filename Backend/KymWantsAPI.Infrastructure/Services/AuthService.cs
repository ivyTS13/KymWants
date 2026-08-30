

using Isopoh.Cryptography.Argon2;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using MapsterMapper;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger; 

        public AuthService(
            IUserRepository userRepository,
            IJwtTokenGenerator jwtTokenGenerator,
            IMapper mapper,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<UserReadDto> RegisterAsync(UserCreateDto dto)
        {
            _logger.LogInformation("Attempting to register new user with email: {Email}", dto.Email);

            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: Email {Email} is already in use.", dto.Email);
                throw new Exception("Email already in use.");
            }

            var user = _mapper.Map<User>(dto);
            user.HashedPassword = Argon2.Hash(dto.Password);

            var createdUser = await _userRepository.CreateAsync(user);

            _logger.LogInformation("User registered successfully. User ID: {UserId}", createdUser.Id);
            return _mapper.Map<UserReadDto>(createdUser);
        }

        public async Task<string> LoginAsync(UserLoginDto dto)
        {

            var user = await _userRepository.GetByEmailAsync(dto.Email);        
            if (user == null || user.HashedPassword == null || !Argon2.Verify(user.HashedPassword, dto.Password))
            {
                _logger.LogWarning("Failed login attempt for email: {Email}. Invalid credentials.", dto.Email);
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            _logger.LogInformation("User {Email} logged in successfully.", dto.Email);
            return _jwtTokenGenerator.GenerateToken(user);
        }

        public async Task<string> GoogleLoginAsync(string email, string name, string googleId, string? profileImageUrl)
        {
            _logger.LogInformation("Processing Google authentication for email: {Email}", email);

            var user = await _userRepository.GetByGoogleIdAsync(googleId);

            if (user == null)
            {
                user = await _userRepository.GetByEmailAsync(email);

                if (user != null)
                {
                    _logger.LogInformation("Existing user {Email} logged in via Google. Linking Google ID.", email);
                    user.GoogleProviderId = googleId;
                    if (string.IsNullOrEmpty(user.ProfileImageUrl)) user.ProfileImageUrl = profileImageUrl;
                    await _userRepository.UpdateAsync(user);
                }
                else
                {
                    // ==========================================
                    // THIS IS THE GOOGLE REGISTRATION
                    // If they don't exist, we create them instantly.
                    // ==========================================
                    _logger.LogInformation("New user {Email} authenticating via Google. Registering account.", email);

                    user = new User
                    {
                        Email = email,
                        DisplayName = name,
                        GoogleProviderId = googleId,
                        ProfileImageUrl = profileImageUrl
                    };
                    user = await _userRepository.CreateAsync(user);
                }
            }
            else
            {
                _logger.LogInformation("Existing Google user {Email} logged in.", email);
            }

            return _jwtTokenGenerator.GenerateToken(user);
        }

        public async Task<UserReadDto> MeAsync(string email)
        {
            _logger.LogInformation("Fetching user profile by email: {Email}", email);

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("User with email {Email} not found.", email);
                throw new KeyNotFoundException("User not found.");
            }

            return _mapper.Map<UserReadDto>(user);
        }
    }
}