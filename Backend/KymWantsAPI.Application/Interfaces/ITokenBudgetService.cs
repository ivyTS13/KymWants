

namespace KymWantsAPI.Application.Interfaces
{
    public interface ITokenBudgetService
    {
        /// <summary>Checks whether a client key (IP/User) has exceeded the 20 requests/min rate limit.</summary>
        bool IsRateLimited(string clientKey, int maxRequestsPerMinute = 20);

        /// <summary>Checks whether the client key is within their daily token allowance.</summary>
        bool HasAvailableTokenBudget(string clientKey, int dailyLimit = 10000);

        /// <summary>Records actual token consumption after a successful LLM call.</summary>
        void RecordTokenUsage(string clientKey, int tokensUsed);
    }
}
