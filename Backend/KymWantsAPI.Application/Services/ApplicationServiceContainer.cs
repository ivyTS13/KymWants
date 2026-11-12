using FluentValidation;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Application.Validators;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace KymWantsAPI.Application.Services
{
    public static class ApplicationServiceContainer
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            var config = TypeAdapterConfig.GlobalSettings;
            config.Scan(Assembly.GetExecutingAssembly());

            services.AddSingleton(config);
            services.AddScoped<IMapper, ServiceMapper>();

            // Validators
            services.AddScoped<IValidator<UserCreateDto>, UserCreateDtoValidator>();
            services.AddScoped<IValidator<UserLoginDto>, UserLoginDtoValidator>();
            services.AddScoped<IValidator<ChangePasswordDto>, ChangePasswordDtoValidator>();
            services.AddScoped<IValidator<ForgotPasswordDto>, ForgotPasswordDtoValidator>();
            services.AddScoped<IValidator<ResetPasswordDto>, ResetPasswordDtoValidator>();
            services.AddScoped<IValidator<UserUpdateDto>, UserUpdateDtoValidator>();
            services.AddScoped<IValidator<CreateCollectionDto>, CreateCollectionDtoValidator>();
            services.AddScoped<IValidator<UpdateCollectionDto>, UpdateCollectionDtoValidator>();
            services.AddScoped<IValidator<CreateDishDto>, CreateDishDtoValidator>();
            services.AddScoped<IValidator<UpdateDishDto>, UpdateDishDtoValidator>();
            services.AddScoped<IValidator<ChatRequestDto>, ChatRequestDtoValidator>();

            // Application Use Cases
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICollectionService, CollectionService>();
            services.AddScoped<IDishService, DishService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IDocumentIngestionService, DocumentIngestionService>();

            return services;
        }
    }
}
