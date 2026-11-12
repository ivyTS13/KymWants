using KymWantsAPI.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentIngestionService _ingestionService;
        private readonly IDocumentRepository _documentRepository;
        private readonly ILogger<DocumentsController> _logger;

        public DocumentsController(
            IDocumentIngestionService ingestionService,
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
        public async Task<IActionResult> UploadDocument(IFormFile file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Please provide a valid non-empty PDF file.");
            }

            if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only PDF files are supported.");
            }

            using var stream = file.OpenReadStream();
            int totalChunks = await _ingestionService.IngestOrUpdatePdfAsync(stream, file.FileName, cancellationToken);

            return Ok(new
            {
                message = $"Successfully processed '{file.FileName}'.",
                fileName = file.FileName,
                chunksCreated = totalChunks
            });
        }

        /// <summary>
        /// Deletes a user manual and all its associated vector chunks.
        /// </summary>
        [HttpDelete("{documentName}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDocument(string documentName, CancellationToken cancellationToken)
        {
            await _documentRepository.DeleteChunksByDocumentNameAsync(documentName, cancellationToken);
            return Ok(new { message = $"All vector chunks for document '{documentName}' have been deleted." });
        }

        /// <summary>
        /// Retrieves all uploaded PDF documents and their total chunk counts.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllDocuments(CancellationToken cancellationToken)
        {
            var documents = await _documentRepository.GetAllDocumentsAsync(cancellationToken);
            return Ok(documents);
        }
    }
}
