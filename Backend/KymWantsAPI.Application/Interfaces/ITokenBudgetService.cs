namespace KymWantsAPI.Application.Interfaces
{
    public interface ITokenBudgetService
    {
        /// <summary>Checks whether a client key (IP/User) has exceeded the requests/min rate limit.</summary>
        Task<bool> IsRateLimitedAsync(string clientKey, int maxRequestsPerMinute = 20, CancellationToken cancellationToken = default);

        /// <summary>Checks whether the client key is within their daily token allowance.</summary>
        Task<bool> HasAvailableTokenBudgetAsync(string clientKey, int dailyLimit = 10000, CancellationToken cancellationToken = default);

        /// <summary>Records actual token consumption after a successful LLM call.</summary>
        Task RecordTokenUsageAsync(string clientKey, int tokensUsed, CancellationToken cancellationToken = default);
    }
}
