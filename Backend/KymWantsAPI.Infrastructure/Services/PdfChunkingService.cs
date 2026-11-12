using KymWantsAPI.Application.Interfaces;
using Microsoft.Extensions.Logging;
using UglyToad.PdfPig;

namespace KymWantsAPI.Infrastructure.Services
{
    public class PdfChunkingService : IPdfChunkingService
    {
        private readonly ILogger<PdfChunkingService> _logger;

        public PdfChunkingService(ILogger<PdfChunkingService> logger)
        {
            _logger = logger;
        }

        public List<(int PageNumber, string Content)> ChunkPdf(Stream pdfStream, int chunkSizeWords = 300, int overlapWords = 50)
        {
            var chunks = new List<(int PageNumber, string Content)>();

            if (pdfStream == null || pdfStream.Length == 0)
            {
                _logger.LogWarning("ChunkPdf was called with an empty or null stream.");
                return chunks;
            }

            try
            {
                _logger.LogInformation("Starting PDF parsing and chunking process. Stream length: {Length} bytes.", pdfStream.Length);

                using (var pdfDocument = PdfDocument.Open(pdfStream))
                {
                    _logger.LogInformation("PDF opened successfully. Total pages: {PageCount}.", pdfDocument.NumberOfPages);

                    foreach (var page in pdfDocument.GetPages())
                    {
                        try
                        {
                            var words = page.Text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                            if (words.Length == 0)
                            {
                                _logger.LogDebug("Page {PageNumber} contained no extractable text.", page.Number);
                                continue;
                            }

                            int step = chunkSizeWords - overlapWords;
                            if (step <= 0) step = chunkSizeWords;

                            for (int i = 0; i < words.Length; i += step)
                            {
                                var chunkWords = words.Skip(i).Take(chunkSizeWords);
                                var text = string.Join(" ", chunkWords).Trim();

                                if (!string.IsNullOrWhiteSpace(text))
                                {
                                    chunks.Add((page.Number, text));
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to process text on page {PageNumber}. Skipping page.", page.Number);
                        }
                    }
                }

                _logger.LogInformation("Completed PDF chunking. Produced {ChunkCount} chunks.", chunks.Count);
                return chunks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fatal error occurred while opening or reading the PDF stream.");
                throw;
            }
        }
    }
}