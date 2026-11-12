using FluentValidation;
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
        private readonly IValidator<ChatRequestDto> _validator;

        public ChatController(IRagChatService ragChatService, IValidator<ChatRequestDto> validator)
        {
            _ragChatService = ragChatService;
            _validator = validator;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatRequestDto request, CancellationToken cancellationToken)
        {
            await _validator.ValidateAndThrowAsync(request, cancellationToken);

            // Identify client by IP address (fallback to unknown)
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown_client";

            var response = await _ragChatService.AskAsync(request.Question, clientIp, cancellationToken);
            return Ok(response);
        }
    }
}
