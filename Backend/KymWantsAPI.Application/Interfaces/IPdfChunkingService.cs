

namespace KymWantsAPI.Application.Interfaces
{
    public interface IPdfChunkingService
    {
        List<(int PageNumber, string Content)> ChunkPdf(Stream pdfStream, int chunkSizeWords = 300, int overlapWords = 50);
    }
}
