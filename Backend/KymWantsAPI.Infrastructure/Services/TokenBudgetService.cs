using KymWantsAPI.Application.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace KymWantsAPI.Infrastructure.Services
{
    public class TokenBudgetService : ITokenBudgetService
    {
        private readonly IConnectionMultiplexer _connectionMultiplexer;
        private readonly ILogger<TokenBudgetService> _logger;

        public TokenBudgetService(
            IConnectionMultiplexer connectionMultiplexer,
            ILogger<TokenBudgetService> logger)
        {
            _connectionMultiplexer = connectionMultiplexer;
            _logger = logger;
        }

        public bool IsRateLimited(string clientKey, int maxRequestsPerMinute = 20)
        {
            try
            {
                var sanitizedKey = NormalizeClientKey(clientKey);
                var db = _connectionMultiplexer.GetDatabase();
                var cacheKey = $"rate_limit:{sanitizedKey}:{DateTime.UtcNow:yyyyMMddHHmm}";

                long currentCount = db.StringIncrement(cacheKey);

                if (currentCount == 1)
                {
                    db.KeyExpire(cacheKey, TimeSpan.FromMinutes(2));
                }

                if (currentCount > maxRequestsPerMinute)
                {
                    _logger.LogWarning("Rate limit reached in Redis for client '{ClientKey}' (Key: {CacheKey}). Requests: {Count}/{Max}",
                        clientKey, cacheKey, currentCount, maxRequestsPerMinute);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Redis failure while checking rate limit for '{ClientKey}'. Defaulting to unblocked.", clientKey);
                return false; // Fail open
            }
        }

        public bool HasAvailableTokenBudget(string clientKey, int dailyLimit )
        {
            try
            {
                var sanitizedKey = NormalizeClientKey(clientKey);
                var db = _connectionMultiplexer.GetDatabase();
                var cacheKey = $"token_budget:{sanitizedKey}:{DateTime.UtcNow:yyyyMMdd}";

                var value = db.StringGet(cacheKey);

                // Safe parsing to prevent InvalidCastException
                int tokensUsedToday = 0;
                if (value.HasValue && !int.TryParse(value.ToString(), out tokensUsedToday))
                {
                    _logger.LogWarning("Failed to parse Redis token budget value '{Value}' as integer for key '{CacheKey}'", value, cacheKey);
                }

                _logger.LogInformation("Checking daily token budget for '{ClientKey}' (Key: {CacheKey}): Used {Used}/{Limit}",
                    clientKey, cacheKey, tokensUsedToday, dailyLimit);

                if (tokensUsedToday >= dailyLimit)
                {
                    _logger.LogWarning("Daily token budget exceeded in Redis for client '{ClientKey}'. Used: {Used}/{Limit}",
                        clientKey, tokensUsedToday, dailyLimit);
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Redis failure while checking token budget for '{ClientKey}'. Defaulting to allowed.", clientKey);
                return true; // Fail open
            }
        }

        public void RecordTokenUsage(string clientKey, int tokensUsed)
        {
            if (tokensUsed <= 0) return;

            try
            {
                var sanitizedKey = NormalizeClientKey(clientKey);
                var db = _connectionMultiplexer.GetDatabase();
                var cacheKey = $"token_budget:{sanitizedKey}:{DateTime.UtcNow:yyyyMMdd}";

                long updatedUsage = db.StringIncrement(cacheKey, tokensUsed);

                if (updatedUsage == tokensUsed)
                {
                    db.KeyExpire(cacheKey, TimeSpan.FromHours(25));
                }

                _logger.LogInformation("Recorded {TokensUsed} tokens in Redis for '{ClientKey}' (Key: {CacheKey}). Total today: {Total}",
                    tokensUsed, clientKey, cacheKey, updatedUsage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Redis failure while recording token usage for '{ClientKey}'.", clientKey);
            }
        }

        /// <summary>
        /// Normalizes client keys (e.g., replaces IPv6 '::1' with 'localhost') to ensure key consistency in Redis.
        /// </summary>
        private static string NormalizeClientKey(string clientKey)
        {
            if (string.IsNullOrWhiteSpace(clientKey)) return "unknown_client";
            return clientKey.Replace("::1", "127.0.0.1").Trim();
        }
    }
}