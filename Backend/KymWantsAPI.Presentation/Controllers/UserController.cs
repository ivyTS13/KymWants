using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace KymWantsAPI.Presentation.Controllers
{
    [EnableRateLimiting("StandardLimit")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        private string GetCurrentUserEmail()
        {
            var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value
                          ?? User.FindFirst("Email")?.Value
                          ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrWhiteSpace(emailClaim))
            {
                return emailClaim;
            }

            throw new UnauthorizedAccessException("User email claim missing or invalid.");
        }

        [HttpPut("me")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<UserReadDto>> UpdateProfile([FromForm] UserUpdateDto dto, CancellationToken cancellationToken)
        {
            var email = GetCurrentUserEmail();
            var updatedUser = await _userService.UpdateProfileAsync(email, dto, cancellationToken);
            return Ok(updatedUser);
        }
    }
}
