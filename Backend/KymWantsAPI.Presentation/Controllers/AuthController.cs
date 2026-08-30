using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KymWantsAPI.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
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
                // Warning is already logged in the service layer, but we can log the HTTP result here
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
        public async Task<IActionResult> GoogleCallback()
        {
            _logger.LogInformation("Received Google OAuth callback.");

            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (!result.Succeeded)
            {
                _logger.LogError("Google authentication failed at the provider level.");
                return BadRequest("Google authentication failed.");
            }

            var claims = result.Principal.Identities.FirstOrDefault()?.Claims;
            var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var name = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            var googleId = claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            var profilePicture = claims?.FirstOrDefault(c => c.Type == "image" || c.Type == "urn:google:picture")?.Value;

            if (email == null || googleId == null)
            {
                _logger.LogError("Google callback succeeded but required claims (Email/GoogleId) were missing.");
                return BadRequest("Failed to retrieve required claims from Google.");
            }

            try
            {
                var token = await _authService.GoogleLoginAsync(email, name ?? "User", googleId, profilePicture);

                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                SetTokenCookie(token);

                _logger.LogInformation("Google Auth completed successfully. Redirecting to frontend.");
                return Redirect("http://localhost:5173");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing Google login data.");
                return StatusCode(500, "An internal error occurred during Google authentication.");
            }
        }
        [HttpGet("me")]
        [Authorize] // Requires a valid JWT token/cookie
        public async Task<IActionResult> GetMe()
        {
            try
            {
                // Extract the email claim from the validated token context
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
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(2)
            };
            Response.Cookies.Append("access_token", token, cookieOptions);
        }
    }
}