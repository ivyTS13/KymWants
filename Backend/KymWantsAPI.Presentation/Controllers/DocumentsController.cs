using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KymWantsAPI.Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly DocumentIngestionService _ingestionService;
        private readonly IDocumentRepository _documentRepository;
        private readonly ILogger<DocumentsController> _logger;

        public DocumentsController(
            DocumentIngestionService ingestionService,
            IDocumentRepository documentRepository,
            ILogger<DocumentsController> logger)
        {
            _ingestionService = ingestionService;
            _documentRepository = documentRepository;
            _logger = logger;
        }

        /// <summary>
        /// Uploads or updates a PDF user manual. Overwrites existing vectors if the document name exists.
        /// </summary>
        [HttpPost("upload")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadDocument(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Please provide a valid non-empty PDF file.");
            }

            if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only PDF files are supported.");
            }

            try
            {
                using var stream = file.OpenReadStream();
                int totalChunks = await _ingestionService.IngestOrUpdatePdfAsync(stream, file.FileName);

                return Ok(new
                {
                    message = $"Successfully processed '{file.FileName}'.",
                    fileName = file.FileName,
                    chunksCreated = totalChunks
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload document '{FileName}'", file.FileName);
                return StatusCode(500, new { message = "An error occurred while processing the document.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a user manual and all its associated vector chunks.
        /// </summary>
        [HttpDelete("{documentName}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDocument(string documentName)
        {
            try
            {
                await _documentRepository.DeleteChunksByDocumentNameAsync(documentName);
                return Ok(new { message = $"All vector chunks for document '{documentName}' have been deleted." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete document '{DocumentName}'", documentName);
                return StatusCode(500, new { message = "An error occurred while deleting the document." });
            }
        }

        /// <summary>
        /// Retrieves all uploaded PDF documents and their total chunk counts.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllDocuments()
        {
            try
            {
                var documents = await _documentRepository.GetAllDocumentsAsync();
                return Ok(documents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch document list.");
                return StatusCode(500, new { message = "An error occurred while fetching documents." });
            }
        }
        [HttpGet("debug")]
        [Authorize]
        public IActionResult Debug()
        {
            return Ok(new
            {
                IsAuthenticated = User.Identity?.IsAuthenticated,
                IsAdmin = User.IsInRole("Admin"),
                RoleClaims = User.FindAll(ClaimTypes.Role).Select(c => c.Value),
                Claims = User.Claims.Select(c => new { c.Type, c.Value })
            });
        }
    }
}