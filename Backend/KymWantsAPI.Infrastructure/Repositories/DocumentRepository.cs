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

        public async Task AddChunksAsync(IEnumerable<DocumentChunk> chunks, CancellationToken cancellationToken = default)
        {
            await _context.DocumentChunks.AddRangeAsync(chunks, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteChunksByDocumentNameAsync(string documentName, CancellationToken cancellationToken = default)
        {
            var existingChunks = await _context.DocumentChunks
                .Where(dc => dc.DocumentName == documentName)
                .ToListAsync(cancellationToken);

            if (existingChunks.Any())
            {
                _context.DocumentChunks.RemoveRange(existingChunks);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task<List<DocumentChunk>> SearchSimilarChunksAsync(float[] queryVector, int topK = 4, CancellationToken cancellationToken = default)
        {
            var searchVector = new Vector(queryVector);

            return await _context.DocumentChunks
                .AsNoTracking()
                .OrderBy(dc => dc.Embedding.CosineDistance(searchVector))
                .Take(topK)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<DocumentSummaryDto>> GetAllDocumentsAsync(CancellationToken cancellationToken = default)
        {
            return await _context.DocumentChunks
                .AsNoTracking()
                .GroupBy(dc => dc.DocumentName)
                .Select(g => new DocumentSummaryDto(
                    g.Key,
                    g.Count()
                ))
                .ToListAsync(cancellationToken);
        }
    }
}
