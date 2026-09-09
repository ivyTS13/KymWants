
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Domain.Models;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IDocumentRepository
    {
        Task AddChunksAsync(IEnumerable<DocumentChunk> chunks);
        Task DeleteChunksByDocumentNameAsync(string documentName);
        Task<List<DocumentChunk>> SearchSimilarChunksAsync(float[] queryVector, int topK = 4);
        Task<List<DocumentSummaryDto>> GetAllDocumentsAsync();
    }
}
