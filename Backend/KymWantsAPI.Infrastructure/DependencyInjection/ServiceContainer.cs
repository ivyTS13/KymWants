using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Infrastructure.KymContext;
using KymWantsAPI.Infrastructure.Repositories;
using KymWantsAPI.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Resend;
using StackExchange.Redis;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

namespace KymWantsAPI.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            // 1. DbContext
            var defaultConnection = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Configuration error: 'ConnectionStrings:DefaultConnection' is missing.");

            services.AddDbContext<KymWantsDBContext>(options =>
                options.UseNpgsql(
                    defaultConnection,
                    npgsqlOptions => npgsqlOptions.EnableRetryOnFailure().UseVector()
                ));

            // Services DI
            // Infrastructure & Cache
            services.AddScoped<ICacheService, RedisCacheService>();
            services.AddScoped<IImageStorageService, ImageKitStorageService>();           
            // Repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDishRepository, DishRepository>();
            services.AddScoped<ICollectionRepository, CollectionRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IDocumentRepository, DocumentRepository>();
            // Infrastructure Services & Adapters
            services.AddScoped<IPasswordHasher, Argon2PasswordHasher>();
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IEmailService, ResendEmailService>();
            services.AddScoped<IPdfChunkingService, PdfChunkingService>();
            services.AddSingleton<ITokenBudgetService, TokenBudgetService>();

            // 2. CORS
            var configuredOrigins = config.GetSection("Frontend:AllowedOrigins").Get<string[]>();
            var redirectUrl = config["Frontend:RedirectUrl"];

            var allowedOrigins = (configuredOrigins != null && configuredOrigins.Length > 0)
                ? configuredOrigins
                : (!string.IsNullOrWhiteSpace(redirectUrl)
                    ? new[] { redirectUrl.TrimEnd('/') }
                    : new[] { "http://localhost:5173" });

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontendApps", policy =>
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials(); // Essential for HttpOnly cookies
                });
            });

            // 3. Authentication (JWT + Google OAuth)
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(options =>
            {
                // Fix cookie behavior for temporary OAuth callback cookies behind HTTPS proxy
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            })
            .AddGoogle(options =>
            {
                options.ClientId = config["Authentication:Google:ClientId"]
                    ?? throw new InvalidOperationException("Configuration error: 'Authentication:Google:ClientId' is missing.");
                options.ClientSecret = config["Authentication:Google:ClientSecret"]
                    ?? throw new InvalidOperationException("Configuration error: 'Authentication:Google:ClientSecret' is missing.");
                options.CallbackPath = "/api/signin-google";
                options.Scope.Add("profile");
                options.Scope.Add("email");

                // CRITICAL: Configure Correlation Cookie settings behind proxy
                options.CorrelationCookie.SameSite = SameSiteMode.Lax;
                options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;

                options.ClaimActions.MapJsonKey("picture", "picture");

                options.Events.OnRemoteFailure = context =>
                {
                    context.HandleResponse();
                    context.Response.Redirect("/api/Auth/google-callback?error=access_denied");
                    return Task.CompletedTask;
                };
            })
            .AddJwtBearer(options =>
            {
                var secret = config["JwtSettings:Secret"]
                    ?? throw new InvalidOperationException("Configuration error: 'JwtSettings:Secret' is missing.");
                var key = Encoding.UTF8.GetBytes(secret);
                string issuer = config["JwtSettings:Issuer"]
                    ?? throw new InvalidOperationException("Configuration error: 'JwtSettings:Issuer' is missing.");
                string audience = config["JwtSettings:Audience"]
                    ?? throw new InvalidOperationException("Configuration error: 'JwtSettings:Audience' is missing.");

                options.RequireHttpsMetadata = true;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key),

                    RoleClaimType = ClaimTypes.Role
                };

                // Extracts JWT directly from HttpOnly Cookie instead of Bearer Header
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Cookies.TryGetValue("access_token", out var token))
                        {
                            context.Token = token;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            // 4. Redis Configuration
            var redisConnString = config.GetConnectionString("RedisConnection") ?? "localhost:6379";
            var redisOptions = ConfigurationOptions.Parse(redisConnString);
            redisOptions.AbortOnConnectFail = false;

            services.AddStackExchangeRedisCache(options =>
            {
                options.ConfigurationOptions = redisOptions;
                options.InstanceName = "KymWants_";
            });

            services.AddSingleton<IConnectionMultiplexer>(sp =>
                ConnectionMultiplexer.Connect(redisOptions));

            // 5. Rate Limiting 
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddPolicy("StandardLimit", httpContext =>
                {
                    var clientIp = httpContext.Request.Headers["CF-Connecting-IP"].FirstOrDefault()?.Trim();
                    if (string.IsNullOrEmpty(clientIp))
                    {
                        clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    }

                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: clientIp,
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 30,
                            Window = TimeSpan.FromMinutes(1),
                            QueueLimit = 0
                        });
                });
            });

            // 6. Enable Forwarded Headers (CRITICAL FOR CLOUDFLARE WORKER PROXY)
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor |
                    ForwardedHeaders.XForwardedHost |
                    ForwardedHeaders.XForwardedProto;

                // Traffic traverses Cloudflare Worker -> Render Proxy -> Kestrel (2 hops)
                options.ForwardLimit = 2;

                // Clear known networks/proxies so ASP.NET Core trusts Cloudflare Worker's headers
                // (protected upstream by X-Origin-Secret middleware)
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
            });

            // 7. Resend Email
            var resendApiKey = config["Resend:ApiKey"];
            if (!string.IsNullOrWhiteSpace(resendApiKey))
            {
                services.AddResend(options =>
                {
                    options.ApiToken = resendApiKey;
                });
            }

            // 8. HttpClient for OpenRouter
            var openRouterKey = config["OpenRouter:ApiKey"];
            var frontendRedirect = config["Frontend:RedirectUrl"] ?? "https://kymwants.com";

            services.AddHttpClient<IRagChatService, RagChatService>(client =>
            {
                if (!string.IsNullOrWhiteSpace(openRouterKey))
                {
                    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {openRouterKey}");
                }
                client.DefaultRequestHeaders.Add("HTTP-Referer", frontendRedirect);
                client.DefaultRequestHeaders.Add("X-Title", "KymWants User Guide RAG");
            });

            services.AddHttpClient<IEmbeddingService, EmbeddingService>(client =>
            {
                client.BaseAddress = new Uri("https://openrouter.ai/api/v1/");
                if (!string.IsNullOrWhiteSpace(openRouterKey))
                {
                    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {openRouterKey}");
                }
                client.DefaultRequestHeaders.Add("HTTP-Referer", frontendRedirect);
                client.DefaultRequestHeaders.Add("X-Title", "KymWants User Guide RAG");
            });

            return services;
        }
    }
}