using FluentAssertions;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Exceptions;
using NSubstitute;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace KymWantsAPI.IntegrationTests
{
    public class AuthorizationAndErrorMappingTests : IClassFixture<ApiFactory>
    {
        private readonly ApiFactory _factory;
        private readonly Guid _userId = Guid.NewGuid();

        public AuthorizationAndErrorMappingTests(ApiFactory factory)
        {
            _factory = factory;
            _factory.Collections.ClearReceivedCalls();
            _factory.Chat.ClearReceivedCalls();
            _factory.Documents.ClearReceivedCalls();
            _factory.Ingestion.ClearReceivedCalls();
        }

        [Fact]
        public async Task SharedCollections_AreAvailableAnonymously()
        {
            _factory.Collections.GetAllSharedAsync(Arg.Any<CancellationToken>())
                .Returns(new List<CollectionResponseDto>
                {
                    new(Guid.NewGuid(), "Shared", true, "Owner", new List<DishResponseDto>())
                });

            var response = await _factory.CreateApiClient().GetAsync("/api/collections/shared");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetArrayLength().Should().Be(1);
        }

        [Fact]
        public async Task MyCollections_RequireAuthentication()
        {
            var response = await _factory.CreateApiClient().GetAsync("/api/collections/me");

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task MyCollections_UseUserIdFromTokenClaim()
        {
            _factory.Collections.GetMyCollectionsAsync(_userId, Arg.Any<CancellationToken>())
                .Returns(new List<CollectionResponseDto>());
            var client = _factory.CreateAuthenticatedClient(_userId, "u@user.com");

            var response = await client.GetAsync("/api/collections/me");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            await _factory.Collections.Received(1).GetMyCollectionsAsync(_userId, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task NotFoundException_IsMappedTo404ProblemDetails()
        {
            _factory.Collections.GetByIdAsync(Arg.Any<Guid>(), _userId, Arg.Any<CancellationToken>())
                .Returns<CollectionResponseDto>(_ => throw new NotFoundException("Collection not found."));
            var client = _factory.CreateAuthenticatedClient(_userId, "u@user.com");

            var response = await client.GetAsync($"/api/collections/{Guid.NewGuid()}");

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
            response.Content.Headers.ContentType!.MediaType.Should().Be("application/problem+json");
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("detail").GetString().Should().Be("Collection not found.");
        }

        [Fact]
        public async Task ForbiddenException_IsMappedTo403()
        {
            _factory.Collections.GetByIdAsync(Arg.Any<Guid>(), _userId, Arg.Any<CancellationToken>())
                .Returns<CollectionResponseDto>(_ => throw new ForbiddenException("nope"));
            var client = _factory.CreateAuthenticatedClient(_userId, "u@user.com");

            var response = await client.GetAsync($"/api/collections/{Guid.NewGuid()}");

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task UnexpectedException_Returns500_WithoutLeakingDetails()
        {
            _factory.Collections.GetMyCollectionsAsync(_userId, Arg.Any<CancellationToken>())
                .Returns<List<CollectionResponseDto>>(_ => throw new InvalidCastException("secret internal detail"));
            var client = _factory.CreateAuthenticatedClient(_userId, "u@user.com");

            var response = await client.GetAsync("/api/collections/me");

            response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
            (await response.Content.ReadAsStringAsync()).Should().NotContain("secret internal detail");
        }

        [Fact]
        public async Task Documents_AreForbiddenForNonAdmin()
        {
            var client = _factory.CreateAuthenticatedClient(_userId, "u@user.com", isAdmin: false);

            var response = await client.GetAsync("/api/documents");

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task Documents_AreUnauthorizedWithoutLogin()
        {
            var response = await _factory.CreateApiClient().GetAsync("/api/documents");

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Documents_AreAvailableToAdmin()
        {
            _factory.Documents.GetAllDocumentsAsync(Arg.Any<CancellationToken>())
                .Returns(new List<DocumentSummaryDto> { new("guide.pdf", 12) });
            var client = _factory.CreateAuthenticatedClient(_userId, "admin@user.com", isAdmin: true);

            var response = await client.GetAsync("/api/documents");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task DebugEndpoint_NoLongerExists()
        {
            var client = _factory.CreateAuthenticatedClient(_userId, "admin@user.com", isAdmin: true);

            var response = await client.GetAsync("/api/documents/debug");

            response.StatusCode.Should().NotBe(HttpStatusCode.OK);
        }

        [Fact]
        public async Task Chat_RequiresAuthentication()
        {
            var response = await _factory.CreateApiClient().PostAsJsonAsync("/api/chat/ask", new { question = "hi" });

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Chat_WithEmptyQuestion_Returns400()
        {
            var client = _factory.CreateAuthenticatedClient(_userId, "u@user.com");

            var response = await client.PostAsJsonAsync("/api/chat/ask", new { question = "" });

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            await _factory.Chat.DidNotReceiveWithAnyArgs().AskAsync(default!, default!, default);
        }

        [Fact]
        public async Task Chat_WhenBudgetExceeded_Returns429()
        {
            _factory.Chat.AskAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns<ChatResponseDto>(_ => throw new RateLimitExceededException("Daily AI query limit reached."));
            var client = _factory.CreateAuthenticatedClient(_userId, "u@user.com");

            var response = await client.PostAsJsonAsync("/api/chat/ask", new { question = "How do I add a dish?" });

            response.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
        }

        [Fact]
        public async Task Chat_ReturnsAnswer_FromService()
        {
            _factory.Chat.AskAsync("How do I add a dish?", Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(new ChatResponseDto { Answer = "Use the + button.", TokensUsed = 5 });
            var client = _factory.CreateAuthenticatedClient(_userId, "u@user.com");

            var response = await client.PostAsJsonAsync("/api/chat/ask", new { question = "How do I add a dish?" });

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("answer").GetString().Should().Be("Use the + button.");
        }

        [Fact]
        public async Task CreateCollection_WithBlankName_Returns400()
        {
            _factory.Collections.CreateAsync(Arg.Any<CreateCollectionDto>(), _userId, Arg.Any<CancellationToken>())
                .Returns<CollectionResponseDto>(_ => throw new FluentValidation.ValidationException(
                    new[] { new FluentValidation.Results.ValidationFailure("Name", "Collection name is required.") }));
            var client = _factory.CreateAuthenticatedClient(_userId, "u@user.com");

            var response = await client.PostAsJsonAsync("/api/collections", new { name = "", isShared = false });

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("errors").TryGetProperty("Name", out _).Should().BeTrue();
        }
    }
}
