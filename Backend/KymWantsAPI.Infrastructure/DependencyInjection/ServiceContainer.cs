using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Infrastructure.KymContext;
using KymWantsAPI.Infrastructure.Repositories;
using KymWantsAPI.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Text;
using System.Threading.RateLimiting;

namespace KymWantsAPI.Infrastructure.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            // 1. DbContext
            services.AddDbContext<KymWantsDBContext>(options =>
                options.UseNpgsql(
                    config.GetConnectionString("DefaultConnection"),
                    npgsqlOptions => npgsqlOptions.EnableRetryOnFailure()
                ));

            // Services DI
            // Infrastructure & Cache
            services.AddScoped<ICacheService, RedisCacheService>();

            // Repositories
            services.AddScoped<IUserRepository,UserRepository>();

            // Application Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

            // 2. CORS
            var allowedOrigins = config.GetSection("Frontend:RedirectUrl").Get<string[]>()
                                 ?? new[] { "http://localhost:5173" }; // fallback

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
            .AddCookie() // Temporary cookie handler for handling the Google OAuth callback redirect
            .AddGoogle(options =>
            {
                options.ClientId = config["Authentication:Google:ClientId"]!;
                options.ClientSecret = config["Authentication:Google:ClientSecret"]!;
            })
            .AddJwtBearer(options =>
            {
                var key = Encoding.UTF8.GetBytes(config["JwtSettings:Secret"]!);
                string issuer = config["JwtSettings:Issuer"]!;
                string audience = config["JwtSettings:Audience"]!;

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
                    IssuerSigningKey = new SymmetricSecurityKey(key)
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
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 30,
                            Window = TimeSpan.FromMinutes(1),
                            QueueLimit = 0
                        }));
            });

            return services;
        }
    }
}