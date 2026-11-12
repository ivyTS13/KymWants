using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IDocumentRepository
    {
        Task AddChunksAsync(IEnumerable<DocumentChunk> chunks, CancellationToken cancellationToken = default);
        Task DeleteChunksByDocumentNameAsync(string documentName, CancellationToken cancellationToken = default);
        Task<List<DocumentChunk>> SearchSimilarChunksAsync(float[] queryVector, int topK = 4, CancellationToken cancellationToken = default);
        Task<List<DocumentSummaryDto>> GetAllDocumentsAsync(CancellationToken cancellationToken = default);
    }
}
