

using Isopoh.Cryptography.Argon2;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using MapsterMapper;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace KymWantsAPI.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger; 

        public AuthService(
            IUserRepository userRepository,
            IJwtTokenGenerator jwtTokenGenerator,
            IEmailService emailService,
            IMapper mapper,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
            _emailService = emailService;
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

        public async Task ChangePasswordAsync(string email, ChangePasswordDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null) throw new KeyNotFoundException("User not found.");

            if (string.IsNullOrEmpty(user.HashedPassword))
                throw new InvalidOperationException("Users logged in via Google cannot change their password here.");

            // Verify old password
            if (!Argon2.Verify( user.HashedPassword, dto.OldPassword))
                throw new UnauthorizedAccessException("Incorrect old password.");

            user.HashedPassword = Argon2.Hash(dto.NewPassword);
            await _userRepository.UpdateAsync(user);
        }

        public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null)
            {
                // Fail silently for security to prevent email enumeration
                return;
            }

            // Generate a secure random token
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var token = Convert.ToBase64String(tokenBytes)
                               .Replace("+", "-")
                               .Replace("/", "_")
                               .Replace("=", ""); // URL safe token

            user.ResetPasswordToken = token;
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(1);

            await _userRepository.UpdateAsync(user);

            // Send email via Resend
            await _emailService.SendPasswordResetEmailAsync(user.Email, token);
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            if (dto.Token == null)
                throw new UnauthorizedAccessException("Invalid or expired reset token.");

            var user = await _userRepository.GetByResetTokenAsync(dto.Token);

            if (user == null || user.ResetPasswordTokenExpiry < DateTime.UtcNow)
                throw new UnauthorizedAccessException("Invalid or expired reset token.");

            // Hash new password and clear tokens
            user.HashedPassword = Argon2.Hash(dto.NewPassword);
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;

            await _userRepository.UpdateAsync(user);
        }
    }
}