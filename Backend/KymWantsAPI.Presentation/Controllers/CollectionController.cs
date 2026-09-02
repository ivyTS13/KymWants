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
        public async Task<ActionResult<List<CollectionResponseDto>>> GetSharedCollections()
        {
            var result = await _collectionService.GetAllSharedAsync();
            return Ok(result);
        }

        [HttpGet("me")]
        public async Task<ActionResult<List<CollectionResponseDto>>> GetMyCollections()
        {
            var userId = GetCurrentUserId();
            var result = await _collectionService.GetMyCollectionsAsync(userId);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<CollectionResponseDto>> GetById(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _collectionService.GetByIdAsync(id, userId);

                if (result == null) return NotFound(new { message = "Collection not found." });
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<CollectionResponseDto>> Create([FromBody] CreateCollectionDto dto)
        {
            var userId = GetCurrentUserId();
            var created = await _collectionService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<CollectionResponseDto>> Update(Guid id, [FromBody] UpdateCollectionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var updated = await _collectionService.UpdateAsync(id, dto, userId);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _collectionService.DeleteAsync(id, userId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
        }
    }
}