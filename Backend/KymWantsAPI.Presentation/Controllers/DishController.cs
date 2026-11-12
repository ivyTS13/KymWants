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
    public class DishesController : ControllerBase
    {
        private readonly IDishService _dishService;

        public DishesController(IDishService dishService)
        {
            _dishService = dishService;
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

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<DishResponseDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var dish = await _dishService.GetByIdAsync(id, cancellationToken);
            return Ok(dish);
        }

        [HttpGet("collection/{collectionId:guid}")]
        public async Task<ActionResult<List<DishResponseDto>>> GetByCollection(Guid collectionId, CancellationToken cancellationToken)
        {
            var dishes = await _dishService.GetByCollectionIdAsync(collectionId, cancellationToken);
            return Ok(dishes);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<DishResponseDto>> Create([FromForm] CreateDishDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var created = await _dishService.CreateAsync(dto, userId, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<DishResponseDto>> Update(Guid id, [FromForm] UpdateDishDto dto, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var updated = await _dishService.UpdateAsync(id, dto, userId, cancellationToken);
            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            await _dishService.DeleteAsync(id, userId, cancellationToken);
            return NoContent();
        }
    }
}
