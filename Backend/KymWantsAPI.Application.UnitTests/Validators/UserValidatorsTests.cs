using FluentAssertions;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Validators;
using Xunit;

namespace KymWantsAPI.Application.UnitTests.Validators
{
    public class UserValidatorsTests
    {
        [Theory]
        [InlineData("", "password123", false)]
        [InlineData("not-an-email", "password123", false)]
        [InlineData("user@example.com", "short", false)]
        [InlineData("user@example.com", "", false)]
        [InlineData("user@example.com", "password123", true)]
        public void UserCreateDtoValidator_ValidatesEmailAndPassword(string email, string password, bool expectedValid)
        {
            var validator = new UserCreateDtoValidator();

            var result = validator.Validate(new UserCreateDto(email, password, "Name"));

            result.IsValid.Should().Be(expectedValid);
        }

        [Fact]
        public void UserCreateDtoValidator_RejectsDisplayNameOver100Chars()
        {
            var validator = new UserCreateDtoValidator();

            var result = validator.Validate(new UserCreateDto("user@example.com", "password123", new string('a', 101)));

            result.IsValid.Should().BeFalse();
        }

        [Theory]
        [InlineData("", "newpassword1", false)]
        [InlineData("old", "short", false)]
        [InlineData("old", "newpassword1", true)]
        public void ChangePasswordDtoValidator_Validates(string oldPassword, string newPassword, bool expectedValid)
        {
            var validator = new ChangePasswordDtoValidator();

            validator.Validate(new ChangePasswordDto(oldPassword, newPassword)).IsValid.Should().Be(expectedValid);
        }

        [Theory]
        [InlineData("", "newpassword1", false)]
        [InlineData("token", "short", false)]
        [InlineData("token", "newpassword1", true)]
        public void ResetPasswordDtoValidator_Validates(string token, string newPassword, bool expectedValid)
        {
            var validator = new ResetPasswordDtoValidator();

            validator.Validate(new ResetPasswordDto(token, newPassword)).IsValid.Should().Be(expectedValid);
        }

        [Theory]
        [InlineData("", false)]
        [InlineData("nope", false)]
        [InlineData("user@example.com", true)]
        public void ForgotPasswordDtoValidator_Validates(string email, bool expectedValid)
        {
            var validator = new ForgotPasswordDtoValidator();

            validator.Validate(new ForgotPasswordDto(email)).IsValid.Should().Be(expectedValid);
        }
    }
}
