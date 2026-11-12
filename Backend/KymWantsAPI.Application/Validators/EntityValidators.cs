using FluentValidation;
using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Validators
{
    public class CreateCollectionDtoValidator : AbstractValidator<CreateCollectionDto>
    {
        public CreateCollectionDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Collection name is required.")
                .MaximumLength(100).WithMessage("Collection name must not exceed 100 characters.");
        }
    }

    public class UpdateCollectionDtoValidator : AbstractValidator<UpdateCollectionDto>
    {
        public UpdateCollectionDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Collection name is required.")
                .MaximumLength(100).WithMessage("Collection name must not exceed 100 characters.");
        }
    }

    public class CreateDishDtoValidator : AbstractValidator<CreateDishDto>
    {
        public CreateDishDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Dish name is required.")
                .MaximumLength(150).WithMessage("Dish name must not exceed 150 characters.");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0).WithMessage("Valid Category ID is required.");

            RuleFor(x => x.CollectionId)
                .NotEmpty().WithMessage("Collection ID is required.");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");
        }
    }

    public class UpdateDishDtoValidator : AbstractValidator<UpdateDishDto>
    {
        public UpdateDishDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Dish name is required.")
                .MaximumLength(150).WithMessage("Dish name must not exceed 150 characters.");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0).WithMessage("Valid Category ID is required.");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");
        }
    }

    public class ChatRequestDtoValidator : AbstractValidator<ChatRequestDto>
    {
        public ChatRequestDtoValidator()
        {
            RuleFor(x => x.Question)
                .NotEmpty().WithMessage("Question cannot be empty.")
                .MaximumLength(1000).WithMessage("Question must not exceed 1000 characters.");
        }
    }
}
