

using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Infrastructure.Services
{
    public class DocumentIngestionService : IDocumentIngestionService
    {
        private readonly IPdfChunkingService _pdfChunkingService;
        private readonly IEmbeddingService _embeddingService;
        private readonly IDocumentRepository _documentRepository;
        private readonly ILogger<DocumentIngestionService> _logger;

        public DocumentIngestionService(
            IPdfChunkingService pdfChunkingService,
            IEmbeddingService embeddingService,
            IDocumentRepository documentRepository,
            ILogger<DocumentIngestionService> logger)
        {
            _pdfChunkingService = pdfChunkingService;
            _embeddingService = embeddingService;
            _documentRepository = documentRepository;
            _logger = logger;
        }

        public async Task<int> IngestOrUpdatePdfAsync(Stream pdfStream, string fileName)
        {
            _logger.LogInformation("Starting ingestion/update for document '{FileName}'", fileName);

            // 1. Delete existing chunks if this document was previously uploaded
            await _documentRepository.DeleteChunksByDocumentNameAsync(fileName);

            // 2. Extract text chunks from the PDF
            var rawChunks = _pdfChunkingService.ChunkPdf(pdfStream);
            if (!rawChunks.Any())
            {
                _logger.LogWarning("No text extracted from document '{FileName}'.", fileName);
                return 0;
            }

            // 3. Generate embeddings for each chunk
            var chunksToSave = new List<DocumentChunk>();
            foreach (var chunk in rawChunks)
            {
                float[] embedding = await _embeddingService.GetEmbeddingAsync(chunk.Content);

                chunksToSave.Add(new DocumentChunk
                {
                    DocumentName = fileName,
                    PageNumber = chunk.PageNumber,
                    Content = chunk.Content,
                    Embedding = embedding
                });
            }

            // 4. Save new chunks to PostgreSQL
            await _documentRepository.AddChunksAsync(chunksToSave);
            _logger.LogInformation("Successfully ingested '{FileName}' with {ChunkCount} chunks.", fileName, chunksToSave.Count);

            return chunksToSave.Count;
        }
    }
}