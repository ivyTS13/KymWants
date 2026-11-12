using FluentValidation;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Exceptions;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using MapsterMapper;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace KymWantsAPI.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IEmailService _emailService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;
        private readonly IValidator<UserCreateDto> _createValidator;
        private readonly IValidator<UserLoginDto> _loginValidator;
        private readonly IValidator<ChangePasswordDto> _changePasswordValidator;
        private readonly IValidator<ForgotPasswordDto> _forgotPasswordValidator;
        private readonly IValidator<ResetPasswordDto> _resetPasswordValidator;

        public AuthService(
            IUserRepository userRepository,
            IJwtTokenGenerator jwtTokenGenerator,
            IEmailService emailService,
            IPasswordHasher passwordHasher,
            IMapper mapper,
            ILogger<AuthService> logger,
            IValidator<UserCreateDto> createValidator,
            IValidator<UserLoginDto> loginValidator,
            IValidator<ChangePasswordDto> changePasswordValidator,
            IValidator<ForgotPasswordDto> forgotPasswordValidator,
            IValidator<ResetPasswordDto> resetPasswordValidator)
        {
            _userRepository = userRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
            _emailService = emailService;
            _passwordHasher = passwordHasher;
            _mapper = mapper;
            _logger = logger;
            _createValidator = createValidator;
            _loginValidator = loginValidator;
            _changePasswordValidator = changePasswordValidator;
            _forgotPasswordValidator = forgotPasswordValidator;
            _resetPasswordValidator = resetPasswordValidator;
        }

        public async Task<UserReadDto> RegisterAsync(UserCreateDto dto, CancellationToken cancellationToken = default)
        {
            await _createValidator.ValidateAndThrowAsync(dto, cancellationToken);

            _logger.LogInformation("Attempting to register new user with email: {Email}", dto.Email);

            var existingUser = await _userRepository.GetByEmailAsync(dto.Email, cancellationToken);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: Email {Email} is already in use.", dto.Email);
                throw new ConflictException("Email already in use.");
            }

            var user = _mapper.Map<User>(dto);
            user.HashedPassword = _passwordHasher.HashPassword(dto.Password);

            var createdUser = await _userRepository.CreateAsync(user, cancellationToken);

            _logger.LogInformation("User registered successfully. User ID: {UserId}", createdUser.Id);
            return _mapper.Map<UserReadDto>(createdUser);
        }

        public async Task<string> LoginAsync(UserLoginDto dto, CancellationToken cancellationToken = default)
        {
            await _loginValidator.ValidateAndThrowAsync(dto, cancellationToken);

            var user = await _userRepository.GetByEmailAsync(dto.Email, cancellationToken);
            if (user == null || user.HashedPassword == null || !_passwordHasher.VerifyPassword(user.HashedPassword, dto.Password))
            {
                _logger.LogWarning("Failed login attempt for email: {Email}. Invalid credentials.", dto.Email);
                throw new UnauthorizedException("Invalid email or password.");
            }

            _logger.LogInformation("User {Email} logged in successfully.", dto.Email);
            return _jwtTokenGenerator.GenerateToken(user);
        }

        public async Task<string> GoogleLoginAsync(string email, string name, string googleId, string? profileImageUrl, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Processing Google authentication for email: {Email}", email);

            var user = await _userRepository.GetByGoogleIdAsync(googleId, cancellationToken);

            if (user == null)
            {
                user = await _userRepository.GetByEmailAsync(email, cancellationToken);

                if (user != null)
                {
                    _logger.LogInformation("Existing user {Email} logged in via Google. Linking Google ID.", email);
                    user.GoogleProviderId = googleId;
                    if (string.IsNullOrEmpty(user.ProfileImageUrl)) user.ProfileImageUrl = profileImageUrl;
                    await _userRepository.UpdateAsync(user, cancellationToken);
                }
                else
                {
                    _logger.LogInformation("New user {Email} authenticating via Google. Registering account.", email);

                    user = new User
                    {
                        Email = email,
                        DisplayName = name,
                        GoogleProviderId = googleId,
                        ProfileImageUrl = profileImageUrl
                    };
                    user = await _userRepository.CreateAsync(user, cancellationToken);
                }
            }
            else
            {
                _logger.LogInformation("Existing Google user {Email} logged in.", email);
            }

            return _jwtTokenGenerator.GenerateToken(user);
        }

        public async Task<UserReadDto> MeAsync(string email, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Fetching user profile by email: {Email}", email);

            var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("User with email {Email} not found.", email);
                throw new NotFoundException("User not found.");
            }

            return _mapper.Map<UserReadDto>(user);
        }

        public async Task ChangePasswordAsync(string email, ChangePasswordDto dto, CancellationToken cancellationToken = default)
        {
            await _changePasswordValidator.ValidateAndThrowAsync(dto, cancellationToken);

            var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
            if (user == null) throw new NotFoundException("User not found.");

            if (string.IsNullOrEmpty(user.HashedPassword))
                throw new InvalidOperationException("Users logged in via Google cannot change their password here.");

            // Verify old password
            if (!_passwordHasher.VerifyPassword(user.HashedPassword, dto.OldPassword))
                throw new UnauthorizedException("Incorrect old password.");

            user.HashedPassword = _passwordHasher.HashPassword(dto.NewPassword);
            await _userRepository.UpdateAsync(user, cancellationToken);
        }

        public async Task ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken cancellationToken = default)
        {
            await _forgotPasswordValidator.ValidateAndThrowAsync(dto, cancellationToken);

            var user = await _userRepository.GetByEmailAsync(dto.Email, cancellationToken);
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

            // Hash the token before persisting to ensure plaintext tokens are never stored
            user.ResetPasswordToken = HashToken(token);
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(1);

            await _userRepository.UpdateAsync(user, cancellationToken);

            // Send email via Resend with the raw token link
            await _emailService.SendPasswordResetEmailAsync(user.Email, token, cancellationToken);
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto, CancellationToken cancellationToken = default)
        {
            await _resetPasswordValidator.ValidateAndThrowAsync(dto, cancellationToken);

            var hashedToken = HashToken(dto.Token);
            var user = await _userRepository.GetByResetTokenAsync(hashedToken, cancellationToken);

            if (user == null || user.ResetPasswordTokenExpiry < DateTime.UtcNow)
                throw new UnauthorizedException("Invalid or expired reset token.");

            // Hash new password and clear tokens
            user.HashedPassword = _passwordHasher.HashPassword(dto.NewPassword);
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;

            await _userRepository.UpdateAsync(user, cancellationToken);
        }

        private static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes);
        }
    }
}
