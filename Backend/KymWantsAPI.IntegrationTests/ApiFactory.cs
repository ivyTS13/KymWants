using KymWantsAPI.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using NSubstitute;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace KymWantsAPI.IntegrationTests
{
    /// <summary>
    /// Boots the real ASP.NET Core pipeline (routing, auth, exception handler, validators, real
    /// AuthService/JwtTokenGenerator/Argon2) while replacing every external dependency (PostgreSQL,
    /// Redis, OpenRouter, ImageKit, Resend) with substitutes, so no Docker or network is required.
    ///
    /// Runs in a dedicated "Testing" environment so the developer's git-ignored
    /// appsettings.Development.json (real cloud secrets) is never loaded.
    /// </summary>
    public class ApiFactory : WebApplicationFactory<Program>
    {
        public const string JwtSecret = "integration-test-secret-key-0123456789-abcdef";
        public const string Issuer = "KymWantsAPI.Tests";
        public const string Audience = "KymWantsClient.Tests";
        public const string OriginSecret = "test-origin-secret";

        static ApiFactory()
        {
            // Environment variables are visible to the eager configuration reads done while the
            // service collection is being built (e.g. AddInfrastructureService).
            var settings = new Dictionary<string, string>
            {
                ["ConnectionStrings__DefaultConnection"] = "Host=localhost;Database=unused;Username=u;Password=p",
                ["ConnectionStrings__RedisConnection"] = "localhost:6379,abortConnect=false",
                ["JwtSettings__Secret"] = JwtSecret,
                ["JwtSettings__Issuer"] = Issuer,
                ["JwtSettings__Audience"] = Audience,
                ["Authentication__Google__ClientId"] = "test-client-id",
                ["Authentication__Google__ClientSecret"] = "test-client-secret",
                ["Frontend__RedirectUrl"] = "http://localhost:5173",
                ["Resend__ApiKey"] = "re_test",
                ["OpenRouter__ApiKey"] = "sk-test",
                ["ImageKit__PrivateKey"] = "private_test",
                ["OriginSecret"] = OriginSecret
            };
            foreach (var (key, value) in settings)
            {
                Environment.SetEnvironmentVariable(key, value);
            }
        }

        public IUserRepository Users { get; } = Substitute.For<IUserRepository>();
        public IEmailService Email { get; } = Substitute.For<IEmailService>();
        public ICollectionService Collections { get; } = Substitute.For<ICollectionService>();
        public IRagChatService Chat { get; } = Substitute.For<IRagChatService>();
        public IDocumentRepository Documents { get; } = Substitute.For<IDocumentRepository>();
        public IDocumentIngestionService Ingestion { get; } = Substitute.For<IDocumentIngestionService>();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                Replace(services, Users);
                Replace(services, Email);
                Replace(services, Collections);
                Replace(services, Chat);
                Replace(services, Documents);
                Replace(services, Ingestion);
            });
        }

        private static void Replace<T>(IServiceCollection services, T instance) where T : class
        {
            services.RemoveAll<T>();
            services.AddSingleton(instance);
        }

        public HttpClient CreateApiClient()
        {
            var client = CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false, AllowAutoRedirect = false });
            client.DefaultRequestHeaders.Add("X-Origin-Secret", OriginSecret);
            return client;
        }

        public HttpClient CreateAuthenticatedClient(Guid userId, string email, bool isAdmin = false)
        {
            var client = CreateApiClient();
            client.DefaultRequestHeaders.Add("Cookie", $"access_token={MintToken(userId, email, isAdmin)}");
            return client;
        }

        public static string MintToken(Guid userId, string email, bool isAdmin)
        {
            var role = isAdmin ? "Admin" : "User";
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Role, role)
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
            var token = new JwtSecurityToken(
                issuer: Issuer,
                audience: Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
