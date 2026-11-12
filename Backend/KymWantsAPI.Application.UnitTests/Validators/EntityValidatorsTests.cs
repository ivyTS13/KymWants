using FluentAssertions;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Validators;
using Xunit;

namespace KymWantsAPI.Application.UnitTests.Validators
{
    public class EntityValidatorsTests
    {
        [Theory]
        [InlineData("", false)]
        [InlineData("   ", false)]
        [InlineData("My Collection", true)]
        public void CreateCollectionDtoValidator_RequiresName(string name, bool expectedValid)
        {
            new CreateCollectionDtoValidator().Validate(new CreateCollectionDto(name, null)).IsValid.Should().Be(expectedValid);
        }

        [Fact]
        public void CreateCollectionDtoValidator_RejectsNameOver100Chars()
        {
            new CreateCollectionDtoValidator().Validate(new CreateCollectionDto(new string('a', 101), null)).IsValid.Should().BeFalse();
        }

        [Fact]
        public void CreateDishDtoValidator_RejectsInvalidCategoryAndEmptyCollection()
        {
            var validator = new CreateDishDtoValidator();

            validator.Validate(new CreateDishDto("Dish", null, 0, Guid.NewGuid(), null)).IsValid.Should().BeFalse();
            validator.Validate(new CreateDishDto("Dish", null, 1, Guid.Empty, null)).IsValid.Should().BeFalse();
        }

        [Fact]
        public void CreateDishDtoValidator_AcceptsValidDish()
        {
            new CreateDishDtoValidator()
                .Validate(new CreateDishDto("Dish", "Tasty", 1, Guid.NewGuid(), null))
                .IsValid.Should().BeTrue();
        }

        [Fact]
        public void CreateDishDtoValidator_RejectsLongDescription()
        {
            new CreateDishDtoValidator()
                .Validate(new CreateDishDto("Dish", new string('a', 1001), 1, Guid.NewGuid(), null))
                .IsValid.Should().BeFalse();
        }

        [Theory]
        [InlineData("", false)]
        [InlineData("How do I create a collection?", true)]
        public void ChatRequestDtoValidator_RequiresQuestion(string question, bool expectedValid)
        {
            new ChatRequestDtoValidator().Validate(new ChatRequestDto(question)).IsValid.Should().Be(expectedValid);
        }

        [Fact]
        public void ChatRequestDtoValidator_RejectsQuestionOver1000Chars()
        {
            new ChatRequestDtoValidator().Validate(new ChatRequestDto(new string('a', 1001))).IsValid.Should().BeFalse();
        }
    }
}
