using FluentAssertions;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Domain.Models;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace KymWantsAPI.IntegrationTests
{
    /// <summary>
    /// End-to-end through the real HTTP pipeline with the real AuthService, validators, password
    /// hasher, JWT generator and global exception handler. Only the persistence/email edges are faked.
    /// </summary>
    public class AuthEndpointsTests : IClassFixture<ApiFactory>
    {
        private readonly ApiFactory _factory;

        public AuthEndpointsTests(ApiFactory factory)
        {
            _factory = factory;
            _factory.Users.ClearReceivedCalls();
        }

        [Fact]
        public async Task Register_WithWeakPassword_Returns400ProblemDetailsWithFieldErrors()
        {
            var client = _factory.CreateApiClient();

            var response = await client.PostAsJsonAsync("/api/auth/register",
                new { email = "new@user.com", password = "short", displayName = "New" });

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            response.Content.Headers.ContentType!.MediaType.Should().Be("application/problem+json");
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("errors").TryGetProperty("Password", out _).Should().BeTrue();
            await _factory.Users.DidNotReceiveWithAnyArgs().CreateAsync(default!, default);
        }

        [Fact]
        public async Task Register_WithDuplicateEmail_Returns409()
        {
            _factory.Users.GetByEmailAsync("dup@user.com", Arg.Any<CancellationToken>())
                .Returns(new User { Email = "dup@user.com" });
            var client = _factory.CreateApiClient();

            var response = await client.PostAsJsonAsync("/api/auth/register",
                new { email = "dup@user.com", password = "password123", displayName = "Dup" });

            response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }

        [Fact]
        public async Task Register_WithValidData_PersistsHashedPassword_AndReturns200()
        {
            _factory.Users.GetByEmailAsync("ok@user.com", Arg.Any<CancellationToken>()).Returns((User?)null);
            _factory.Users.CreateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>())
                .Returns(ci => { var u = ci.Arg<User>(); u.Id = Guid.NewGuid(); return u; });
            var client = _factory.CreateApiClient();

            var response = await client.PostAsJsonAsync("/api/auth/register",
                new { email = "ok@user.com", password = "password123", displayName = "Ok" });

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            await _factory.Users.Received(1).CreateAsync(
                Arg.Is<User>(u => u.HashedPassword != null && u.HashedPassword != "password123"),
                Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Login_WithUnknownUser_Returns401()
        {
            _factory.Users.GetByEmailAsync("ghost@user.com", Arg.Any<CancellationToken>()).Returns((User?)null);
            var client = _factory.CreateApiClient();

            var response = await client.PostAsJsonAsync("/api/auth/login",
                new { email = "ghost@user.com", password = "password123" });

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Login_WithCorrectPassword_SetsHttpOnlyAccessTokenCookie_ThatAuthenticatesMe()
        {
            using var scope = _factory.Services.CreateScope();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "login@user.com",
                DisplayName = "Login",
                HashedPassword = hasher.HashPassword("password123")
            };
            _factory.Users.GetByEmailAsync("login@user.com", Arg.Any<CancellationToken>()).Returns(user);
            var client = _factory.CreateApiClient();

            var login = await client.PostAsJsonAsync("/api/auth/login",
                new { email = "login@user.com", password = "password123" });

            login.StatusCode.Should().Be(HttpStatusCode.OK);
            var setCookie = login.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("access_token="));
            setCookie.ToLowerInvariant().Should().Contain("httponly").And.Contain("secure");

            var cookieValue = setCookie.Split(';')[0];
            var meRequest = new HttpRequestMessage(HttpMethod.Get, "/api/auth/me");
            meRequest.Headers.Add("Cookie", cookieValue);
            var me = await client.SendAsync(meRequest);

            me.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await me.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("email").GetString().Should().Be("login@user.com");
        }

        [Fact]
        public async Task Me_WithoutCookie_Returns401()
        {
            var response = await _factory.CreateApiClient().GetAsync("/api/auth/me");

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Me_WithTamperedToken_Returns401()
        {
            var client = _factory.CreateApiClient();
            var request = new HttpRequestMessage(HttpMethod.Get, "/api/auth/me");
            request.Headers.Add("Cookie", $"access_token={ApiFactory.MintToken(Guid.NewGuid(), "a@b.com", false)}x");

            var response = await client.SendAsync(request);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task ForgotPassword_ForUnknownEmail_Returns200_WithoutSendingEmail()
        {
            _factory.Users.GetByEmailAsync("nobody@user.com", Arg.Any<CancellationToken>()).Returns((User?)null);

            var response = await _factory.CreateApiClient().PostAsJsonAsync("/api/auth/forgot-password",
                new { email = "nobody@user.com" });

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            await _factory.Email.DidNotReceiveWithAnyArgs().SendPasswordResetEmailAsync(default!, default!, default);
        }

        [Fact]
        public async Task ResetPassword_WithInvalidToken_Returns401()
        {
            _factory.Users.GetByResetTokenAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);

            var response = await _factory.CreateApiClient().PostAsJsonAsync("/api/auth/reset-password",
                new { token = "bogus", newPassword = "password123" });

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Request_WithoutOriginSecretHeader_Returns403()
        {
            var client = _factory.CreateClient(); // no X-Origin-Secret

            var response = await client.GetAsync("/api/collections/shared");

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task Request_WithInvalidOriginSecretHeader_Returns403()
        {
            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Origin-Secret", "wrong-secret");

            var response = await client.GetAsync("/api/collections/shared");

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task Request_WithDuplicateOriginSecretHeaders_Returns403()
        {
            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Origin-Secret", new[] { ApiFactory.OriginSecret, ApiFactory.OriginSecret });

            var response = await client.GetAsync("/api/collections/shared");

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task HealthCheck_WithoutOriginSecretHeader_Returns200()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("/healthz");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task Logout_DeletesAccessTokenCookie_WithMatchingAttributes()
        {
            var client = _factory.CreateApiClient();

            var response = await client.PostAsync("/api/auth/logout", null);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var setCookie = response.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("access_token="));
            setCookie.Should().ContainEquivalentOf("httponly");
            setCookie.Should().ContainEquivalentOf("secure");
            setCookie.Should().ContainEquivalentOf("samesite=lax");
        }
    }
}
