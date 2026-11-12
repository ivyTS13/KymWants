using KymWantsAPI.Application.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;

namespace KymWantsAPI.Infrastructure.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _cache;
        private readonly IConnectionMultiplexer _connectionMultiplexer;
        private readonly ILogger<RedisCacheService> _logger;

        public RedisCacheService(
            IDistributedCache cache,
            IConnectionMultiplexer connectionMultiplexer,
            ILogger<RedisCacheService> logger)
        {
            _cache = cache;
            _connectionMultiplexer = connectionMultiplexer;
            _logger = logger;
        }

        public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                var cachedData = await _cache.GetStringAsync(key, cancellationToken);
                if (cachedData == null) return default;

                return JsonSerializer.Deserialize<T>(cachedData);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis Cache Read Failed for key {Key}", key);
                return default;
            }
        }

        public async Task SetAsync<T>(string key, T data, TimeSpan? absoluteExpireTime = null, TimeSpan? slidingExpireTime = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = absoluteExpireTime ?? TimeSpan.FromMinutes(10),
                    SlidingExpiration = slidingExpireTime
                };

                var serializedData = JsonSerializer.Serialize(data);
                await _cache.SetStringAsync(key, serializedData, options, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis Cache Write Failed for key {Key}", key);
            }
        }

        public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                await _cache.RemoveAsync(key, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis Cache Remove Failed for key {Key}", key);
            }
        }

        public async Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
        {
            try
            {
                foreach (var endpoint in _connectionMultiplexer.GetEndPoints())
                {
                    var server = _connectionMultiplexer.GetServer(endpoint);
                    if (server.IsReplica) continue;

                    var db = _connectionMultiplexer.GetDatabase();

                    await foreach (var key in server.KeysAsync(pattern: $"*{pattern}*"))
                    {
                        if (cancellationToken.IsCancellationRequested) break;
                        await db.KeyDeleteAsync(key);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis Cache RemoveByPattern Failed for pattern {Pattern}", pattern);
            }
        }

        public async Task InvalidateUserCacheAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            try
            {
                string cacheKey = $"collection_{userId}";
                await RemoveAsync(cacheKey, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to invalidate cache for user {UserId}.", userId);
            }
        }
    }
}
