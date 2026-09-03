using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace KymWantsAPI.Presentation.Controllers
{
    [EnableRateLimiting("StandardLimit")]
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, ILogger<AuthController> logger, IConfiguration configuration)
        {
            _authService = authService;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserCreateDto request)
        {
            try
            {
                var result = await _authService.RegisterAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during user registration.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto request)
        {
            try
            {
                var token = await _authService.LoginAsync(request);
                SetTokenCookie(token);
                return Ok(new { message = "Login successful" });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Returning 401 Unauthorized for login request.");
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login.");
                return StatusCode(500, "An internal error occurred.");
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            _logger.LogInformation("User initiated logout. Deleting cookie.");
            Response.Cookies.Delete("access_token");
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("signin-google")]
        public IActionResult SignInGoogle()
        {
            _logger.LogInformation("Initiating Google OAuth challenge.");
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action(nameof(GoogleCallback))
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback([FromQuery] string? error, [FromQuery] string? error_description)
        {
            var frontendUrl = _configuration["Frontend:RedirectUrl"];

            // 1. Handle user cancellation or refusal from Google
            if (!string.IsNullOrEmpty(error))
            {
                _logger.LogWarning("Google OAuth access was denied or canceled. Error: {Error}, Description: {Description}", error, error_description);

                // Sign out of the temporary external cookie scheme to clear state
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                // Ensure no access token cookie remains
                Response.Cookies.Delete("access_token");

                if (!string.IsNullOrEmpty(frontendUrl))
                {
                    return Redirect($"{frontendUrl}?error=access_denied");
                }
                return BadRequest(new { message = "Google authentication was canceled or denied." });
            }

            _logger.LogInformation("Received Google OAuth callback.");

            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (!result.Succeeded || result.Principal == null)
            {
                _logger.LogError("Google authentication failed at the provider level.");

                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                Response.Cookies.Delete("access_token");

                if (!string.IsNullOrEmpty(frontendUrl))
                {
                    return Redirect($"{frontendUrl}?error=auth_failed");
                }
                return BadRequest("Google authentication failed.");
            }

            // 2. Extract Claims
            var claims = result.Principal.Identities.FirstOrDefault()?.Claims;
            var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var name = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            var googleId = claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            var profilePicture = claims?.FirstOrDefault(c =>
                c.Type == "picture" ||
                c.Type == "urn:google:picture" ||
                c.Type == "image")?.Value;

            if (email == null || googleId == null)
            {
                _logger.LogError("Google callback succeeded but required claims (Email/GoogleId) were missing.");
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                return BadRequest("Failed to retrieve required claims from Google.");
            }

            try
            {
                var token = await _authService.GoogleLoginAsync(email, name ?? "User", googleId, profilePicture);

                // Clear the temporary authentication cookie created during OAuth flow
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                // Set the actual JWT token cookie ONLY on success
                SetTokenCookie(token);

                _logger.LogInformation("Google Auth completed successfully. Redirecting to frontend.");

                if (string.IsNullOrEmpty(frontendUrl))
                {
                    _logger.LogError("FrontendUrl configuration is missing.");
                    return StatusCode(500, "Server configuration error.");
                }
                return Redirect(frontendUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing Google login data.");

                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                Response.Cookies.Delete("access_token");

                if (!string.IsNullOrEmpty(frontendUrl))
                {
                    return Redirect($"{frontendUrl}?error=server_error");
                }
                return StatusCode(500, "An internal error occurred during Google authentication.");
            }
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            try
            {
                var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value;

                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("Unauthorized 'me' request: Email claim missing from token.");
                    return Unauthorized(new { message = "Invalid token claims." });
                }

                var userDto = await _authService.MeAsync(email);
                return Ok(userDto);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "User profile not found during 'me' request.");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while fetching user profile.");
                return StatusCode(500, "An internal error occurred.");
            }
        }

        private void SetTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddHours(2)
            };
            Response.Cookies.Append("access_token", token, cookieOptions);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value;
                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("Unauthorized 'me' request: Email claim missing from token.");
                    return Unauthorized(new { message = "Invalid token claims." });
                }
                await _authService.ChangePasswordAsync(email, dto);
                return Ok(new { message = "Password updated successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            await _authService.ForgotPasswordAsync(dto);
            return Ok(new { message = "If the email is registered, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                await _authService.ResetPasswordAsync(dto);
                return Ok(new { message = "Password has been successfully reset." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}