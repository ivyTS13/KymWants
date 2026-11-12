using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace KymWantsAPI.Infrastructure.Services
{
    public class RagChatService : IRagChatService
    {
        private readonly IEmbeddingService _embeddingService;
        private readonly IDocumentRepository _documentRepository;
        private readonly ITokenBudgetService _tokenBudgetService;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<RagChatService> _logger;

        public RagChatService(
            IEmbeddingService embeddingService,
            IDocumentRepository documentRepository,
            ITokenBudgetService tokenBudgetService,
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<RagChatService> logger)
        {
            _embeddingService = embeddingService;
            _documentRepository = documentRepository;
            _tokenBudgetService = tokenBudgetService;
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ChatResponseDto> AskAsync(string question, string clientKey)
        {
            // 1. Rate Limit & Token Budget Verification
            if (_tokenBudgetService.IsRateLimited(clientKey))
            {
                throw new InvalidOperationException("Rate limit reached. Please wait a minute before asking another question.");
            }

            if (!_tokenBudgetService.HasAvailableTokenBudget(clientKey))
            {
                throw new InvalidOperationException("Daily AI query limit reached for your session.");
            }

            // 2. Query Vectorization
            var queryVector = await _embeddingService.GetEmbeddingAsync(question);

            // 3. Similarity Search via pgvector
            var relevantChunks = await _documentRepository.SearchSimilarChunksAsync(queryVector, topK: 4);

            // 4. Construct System Context Prompt
            var contextBuilder = new StringBuilder();
            var sources = new List<string>();

            foreach (var chunk in relevantChunks)
            {
                contextBuilder.AppendLine($"--- [Document: {chunk.DocumentName}, Page: {chunk.PageNumber}] ---");
                contextBuilder.AppendLine(chunk.Content);
                contextBuilder.AppendLine();

                var sourceLabel = $"{chunk.DocumentName} (Page {chunk.PageNumber})";
                if (!sources.Contains(sourceLabel)) sources.Add(sourceLabel);
            }

            var chatModel = _configuration["OpenRouter:ChatModel"] ?? "openrouter/free";

            var payload = new
            {
                model = chatModel,
                messages = new[]
                {
                    new
                    {
                        role = "system",
                        content = "You are an accurate user guide assistant for KymWants. " +
                                  "Answer the user's question using ONLY the provided context snippets below. " +
                                  "If the answer is not contained in the context, politely state that the information isn't available in the guide.\n\n" +
                                  $"CONTEXT:\n{contextBuilder}"
                    },
                    new
                    {
                        role = "user",
                        content = question
                    }
                }
            };

            // 5. Query OpenRouter Chat API
            try
            {
                _logger.LogInformation("Sending chat completion request to OpenRouter model '{Model}' for client '{ClientKey}'", chatModel, clientKey);

                var response = await _httpClient.PostAsJsonAsync("https://openrouter.ai/api/v1/chat/completions", payload);
                var responseBody = await response.Content.ReadAsStringAsync();

                // 5a. Inspect HTTP Status Code before throwing
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("OpenRouter API HTTP {StatusCode} Error: {ResponseBody}", response.StatusCode, responseBody);
                    throw new HttpRequestException($"OpenRouter HTTP {response.StatusCode}: {responseBody}");
                }

                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;

                // 5b. Safely check for OpenRouter inline error payloads
                if (root.TryGetProperty("error", out var errorElement))
                {
                    var errorMsg = errorElement.TryGetProperty("message", out var msg)
                        ? msg.GetString()
                        : responseBody;

                    _logger.LogError("OpenRouter API returned error response: {ErrorMessage}", errorMsg);
                    throw new InvalidOperationException($"OpenRouter Error: {errorMsg}");
                }

                // 5c. Validate 'choices' array existence
                if (!root.TryGetProperty("choices", out var choices) ||
                    choices.ValueKind != JsonValueKind.Array ||
                    choices.GetArrayLength() == 0)
                {
                    _logger.LogError("OpenRouter response missing 'choices' array. Response: {ResponseBody}", responseBody);
                    throw new InvalidOperationException("OpenRouter response did not contain 'choices'.");
                }

                var answer = choices[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? "No answer generated.";

                var totalTokens = root.TryGetProperty("usage", out var usage) && usage.TryGetProperty("total_tokens", out var tokens)
                    ? tokens.GetInt32()
                    : 0;

                // 6. Record Token Consumption
                if (totalTokens > 0)
                {
                    _tokenBudgetService.RecordTokenUsage(clientKey, totalTokens);
                }

                return new ChatResponseDto
                {
                    Answer = answer,
                    Sources = sources,
                    TokensUsed = totalTokens
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get chat response from OpenRouter.");
                throw;
            }
        }
    }
}