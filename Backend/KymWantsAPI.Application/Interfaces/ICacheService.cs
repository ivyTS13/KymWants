namespace KymWantsAPI.Application.Interfaces
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
        Task SetAsync<T>(string key, T data, TimeSpan? absoluteExpireTime = null, TimeSpan? slidingExpireTime = null, CancellationToken cancellationToken = default);
        Task RemoveAsync(string key, CancellationToken cancellationToken = default);
        Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
        Task InvalidateUserCacheAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
