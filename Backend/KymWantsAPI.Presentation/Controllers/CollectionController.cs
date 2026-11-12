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
    public class CollectionsController : ControllerBase
    {
        private readonly ICollectionService _collectionService;

        public CollectionsController(ICollectionService collectionService)
        {
            _collectionService = collectionService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }

            throw new UnauthorizedAccessException("User ID claim missing or invalid.");
        }

        [HttpGet("shared")]
        [AllowAnonymous]
        public async Task<ActionResult<List<CollectionResponseDto>>> GetSharedCollections(CancellationToken cancellationToken)
        {
            var result = await _collectionService.GetAllSharedAsync(cancellationToken);
            return Ok(result);
        }

        [HttpGet("me")]
        public async Task<ActionResult<List<CollectionResponseDto>>> GetMyCollections(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var result = await _collectionService.GetMyCollectionsAsync(userId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<CollectionResponseDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var result = await _collectionService.GetByIdAsync(id, userId, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<CollectionResponseDto>> Create([FromBody] CreateCollectionDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var created = await _collectionService.CreateAsync(dto, userId, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<CollectionResponseDto>> Update(Guid id, [FromBody] UpdateCollectionDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var updated = await _collectionService.UpdateAsync(id, dto, userId, cancellationToken);
            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            await _collectionService.DeleteAsync(id, userId, cancellationToken);
            return NoContent();
        }
    }
}
