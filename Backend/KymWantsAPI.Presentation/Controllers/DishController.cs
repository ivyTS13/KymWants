using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KymWantsAPI.Presentation.Controllers
{
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
        public async Task<ActionResult<DishResponseDto>> GetById(Guid id)
        {
            var dish = await _dishService.GetByIdAsync(id);
            if (dish == null) return NotFound(new { message = "Dish not found." });
            return Ok(dish);
        }

        [HttpGet("collection/{collectionId:guid}")]
        public async Task<ActionResult<List<DishResponseDto>>> GetByCollection(Guid collectionId)
        {
            var dishes = await _dishService.GetByCollectionIdAsync(collectionId);
            return Ok(dishes);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<DishResponseDto>> Create([FromForm] CreateDishDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var created = await _dishService.CreateAsync(dto, userId);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
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

        [HttpPut("{id:guid}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<DishResponseDto>> Update(Guid id, [FromForm] UpdateDishDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var updated = await _dishService.UpdateAsync(id, dto, userId);
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
                await _dishService.DeleteAsync(id, userId);
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