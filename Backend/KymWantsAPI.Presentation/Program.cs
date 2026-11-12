using Microsoft.OpenApi.Models;
using KymWantsAPI.Application.Services;
using KymWantsAPI.Infrastructure.DependencyInjection;
using KymWantsAPI.Presentation.Middleware;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureService(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 1. Configure Swagger Generator to declare Cookie Authentication
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "KymWantsAPI",
        Version = "v1"
    });

    // Define Cookie Security Scheme (e.g. for HttpOnly session/JWT cookie)
    options.AddSecurityDefinition("cookieAuth", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Cookie,
        Name = "access_token", // Change this to your exact cookie name (e.g., "jwt", "session_id")
        Description = "Cookie-based authentication"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "cookieAuth"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    // 1. Enable withCredentials in Swagger UI so cookies are sent with requests
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "KymWantsAPI v1");
        options.ConfigObject.AdditionalItems["withCredentials"] = true;
    });
}
// 2. REJECT direct access to Render backend if secret header is missing or invalid
byte[]? expectedSecretHash = null;
if (!app.Environment.IsDevelopment())
{
    var expectedSecret = app.Configuration["OriginSecret"]?.Trim();
    if (string.IsNullOrWhiteSpace(expectedSecret))
    {
        throw new InvalidOperationException("Configuration error: 'OriginSecret' is missing.");
    }

    expectedSecretHash = SHA256.HashData(Encoding.UTF8.GetBytes(expectedSecret));
}

app.Use(async (context, next) =>
{
    // Exempt health checks so Render's internal probe works without Cloudflare's secret header
    if (!app.Environment.IsDevelopment() &&
        !context.Request.Path.Equals("/healthz", StringComparison.OrdinalIgnoreCase))
    {
        if (!context.Request.Headers.TryGetValue("X-Origin-Secret", out var providedValues) ||
            providedValues.Count != 1 ||
            string.IsNullOrEmpty(providedValues[0]))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("403 Forbidden: Direct access to backend origin is not allowed.");
            return;
        }

        var providedHash = SHA256.HashData(Encoding.UTF8.GetBytes(providedValues[0]!));
        if (!CryptographicOperations.FixedTimeEquals(providedHash, expectedSecretHash))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("403 Forbidden: Direct access to backend origin is not allowed.");
            return;
        }
    }

    await next();
});

app.UseForwardedHeaders();
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowFrontendApps");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapGet("/healthz", () => Results.Ok(new { status = "healthy" })).ExcludeFromDescription();
app.MapControllers();
app.Run();

// Exposes the entry point to the integration test project (WebApplicationFactory<Program>).
public partial class Program { }