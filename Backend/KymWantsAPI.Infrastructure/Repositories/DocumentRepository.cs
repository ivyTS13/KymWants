

using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using KymWantsAPI.Infrastructure.KymContext;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;

namespace KymWantsAPI.Infrastructure.Repositories
{

    public class DocumentRepository : IDocumentRepository
    {
        private readonly KymWantsDBContext _context;

        public DocumentRepository(KymWantsDBContext context)
        {
            _context = context;
        }

        public async Task AddChunksAsync(IEnumerable<DocumentChunk> chunks)
        {
            await _context.DocumentChunks.AddRangeAsync(chunks);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteChunksByDocumentNameAsync(string documentName)
        {
            var existingChunks = await _context.DocumentChunks
                .Where(dc => dc.DocumentName == documentName)
                .ToListAsync();

            if (existingChunks.Any())
            {
                _context.DocumentChunks.RemoveRange(existingChunks);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<List<DocumentChunk>> SearchSimilarChunksAsync(float[] queryVector, int topK = 4)
        {
            var searchVector = new Vector(queryVector);

            return await _context.DocumentChunks
                .AsNoTracking()
                .OrderBy(dc => dc.Embedding.CosineDistance(searchVector))
                .Take(topK)
                .ToListAsync();
        }
        public async Task<List<DocumentSummaryDto>> GetAllDocumentsAsync()
        {
            return await _context.DocumentChunks
                .AsNoTracking()
                .GroupBy(dc => dc.DocumentName)
                .Select(g => new DocumentSummaryDto(
                    g.Key,
                    g.Count()
                ))
                .ToListAsync();
        }
    }
}
