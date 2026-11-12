using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KymWantsAPI.Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IRagChatService _ragChatService;

        public ChatController(IRagChatService ragChatService)
        {
            _ragChatService = ragChatService;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest("Question cannot be empty.");
            }

            // Identify client by IP address (fallback to unknown)
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown_client";

            try
            {
                var response = await _ragChatService.AskAsync(request.Question, clientIp);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(429, new { message = ex.Message }); // 429 Too Many Requests
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing your request.", detail = ex.Message });
            }
        }
    }
}