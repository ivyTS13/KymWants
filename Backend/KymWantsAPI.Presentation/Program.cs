using Microsoft.OpenApi.Models;
using KymWantsAPI.Application.Services;
using KymWantsAPI.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
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
app.Use(async (context, next) =>
{
    // Skip verification during local development (Optional)
    if (!app.Environment.IsDevelopment())
    {
        var expectedSecret = app.Configuration["OriginSecret"];

        if (!context.Request.Headers.TryGetValue("X-Origin-Secret", out var providedSecret) ||
            providedSecret != expectedSecret)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("403 Forbidden: Direct access to backend origin is not allowed.");
            return;
        }
    }

    await next();
});

app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseCors("AllowFrontendApps");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

// Note: Removed the duplicated app.MapControllers();
app.MapControllers();
app.Run();