using System.Net.Http.Json;
using System.Text.Json;
using KymWantsAPI.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Infrastructure.Services
{
    public class EmbeddingService : IEmbeddingService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmbeddingService> _logger;

        public EmbeddingService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<EmbeddingService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<float[]> GetEmbeddingAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                _logger.LogWarning("GetEmbeddingAsync was called with empty or null text.");
                return Array.Empty<float>();
            }

            var modelName = _configuration["OpenRouter:EmbeddingModel"] ?? "liquid/lfm-2.5-embedding-350m:free";

            var payload = new
            {
                model = modelName,
                input = text,
                encoding_format = "float"
            };

            try
            {
                _logger.LogInformation("Requesting embedding from OpenRouter using model '{Model}'. Text length: {Length} chars.", modelName, text.Length);

                // Relative endpoint using BaseAddress set in Program.cs
                var response = await _httpClient.PostAsJsonAsync("embeddings", payload);

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("OpenRouter returned error {StatusCode}: {ErrorBody}", response.StatusCode, errorBody);
                    response.EnsureSuccessStatusCode();
                }

                var json = await response.Content.ReadFromJsonAsync<JsonElement>();

                var vectorArray = json
                    .GetProperty("data")[0]
                    .GetProperty("embedding")
                    .EnumerateArray()
                    .Select(x => x.GetSingle())
                    .ToArray();

                _logger.LogInformation("Successfully retrieved embedding vector with {Dimension} dimensions.", vectorArray.Length);

                return vectorArray;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request failed while fetching embedding from OpenRouter. Model: {Model}, StatusCode: {StatusCode}", modelName, ex.StatusCode);
                throw;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse JSON response from OpenRouter embedding API. Model: {Model}", modelName);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred while generating embedding. Model: {Model}", modelName);
                throw;
            }
        }
    }
}