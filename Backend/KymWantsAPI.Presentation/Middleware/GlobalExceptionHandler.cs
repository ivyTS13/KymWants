using FluentValidation;
using KymWantsAPI.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace KymWantsAPI.Presentation.Middleware
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);

            var (statusCode, title, detail, errors) = exception switch
            {
                ValidationException validationEx => (
                    StatusCodes.Status400BadRequest,
                    "Validation Error",
                    "One or more validation failures occurred.",
                    validationEx.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
                ),
                NotFoundException notFoundEx => (
                    StatusCodes.Status404NotFound,
                    "Not Found",
                    notFoundEx.Message,
                    null
                ),
                KeyNotFoundException keyNotFoundEx => (
                    StatusCodes.Status404NotFound,
                    "Not Found",
                    keyNotFoundEx.Message,
                    null
                ),
                ForbiddenException forbiddenEx => (
                    StatusCodes.Status403Forbidden,
                    "Forbidden",
                    forbiddenEx.Message,
                    null
                ),
                UnauthorizedException unauthorizedEx => (
                    StatusCodes.Status401Unauthorized,
                    "Unauthorized",
                    unauthorizedEx.Message,
                    null
                ),
                UnauthorizedAccessException unauthorizedAccessEx => (
                    StatusCodes.Status401Unauthorized,
                    "Unauthorized",
                    unauthorizedAccessEx.Message,
                    null
                ),
                ConflictException conflictEx => (
                    StatusCodes.Status409Conflict,
                    "Conflict",
                    conflictEx.Message,
                    null
                ),
                RateLimitExceededException rateLimitEx => (
                    StatusCodes.Status429TooManyRequests,
                    "Too Many Requests",
                    rateLimitEx.Message,
                    null
                ),
                InvalidOperationException invalidOpEx when invalidOpEx.Message.Contains("Rate limit") || invalidOpEx.Message.Contains("Daily AI query limit") => (
                    StatusCodes.Status429TooManyRequests,
                    "Too Many Requests",
                    invalidOpEx.Message,
                    null
                ),
                InvalidOperationException invalidOpEx => (
                    StatusCodes.Status400BadRequest,
                    "Bad Request",
                    invalidOpEx.Message,
                    null
                ),
                _ => (
                    StatusCodes.Status500InternalServerError,
                    "Internal Server Error",
                    "An unexpected error occurred. Please try again later.",
                    null
                )
            };

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = detail,
                Instance = httpContext.Request.Path
            };

            if (errors != null)
            {
                problemDetails.Extensions["errors"] = errors;
            }

            httpContext.Response.StatusCode = statusCode;

            // WriteAsJsonAsync overwrites Content-Type unless it is passed explicitly.
            await httpContext.Response.WriteAsJsonAsync(
                problemDetails,
                options: null,
                contentType: "application/problem+json",
                cancellationToken: cancellationToken);
            return true;
        }
    }
}
