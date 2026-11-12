namespace KymWantsAPI.Application.Interfaces
{
    public interface IEmbeddingService
    {
        Task<float[]> GetEmbeddingAsync(string text, CancellationToken cancellationToken = default);
    }
}
