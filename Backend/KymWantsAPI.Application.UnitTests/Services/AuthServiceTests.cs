using FluentAssertions;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Exceptions;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Application.Services;
using KymWantsAPI.Application.Validators;
using KymWantsAPI.Domain.Models;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using System.Security.Cryptography;
using System.Text;
using Xunit;
using FluentValidation;

namespace KymWantsAPI.Application.UnitTests.Services
{
    public class AuthServiceTests
    {
        private readonly IUserRepository _users = Substitute.For<IUserRepository>();
        private readonly IJwtTokenGenerator _jwt = Substitute.For<IJwtTokenGenerator>();
        private readonly IEmailService _email = Substitute.For<IEmailService>();
        private readonly IPasswordHasher _hasher = Substitute.For<IPasswordHasher>();
        private readonly AuthService _sut;

        public AuthServiceTests()
        {
            _hasher.HashPassword(Arg.Any<string>()).Returns(ci => "hashed:" + ci.Arg<string>());
            _hasher.VerifyPassword(Arg.Any<string>(), Arg.Any<string>())
                   .Returns(ci => ci.ArgAt<string>(0) == "hashed:" + ci.ArgAt<string>(1));
            _jwt.GenerateToken(Arg.Any<User>()).Returns("jwt-token");

            _sut = new AuthService(
                _users, _jwt, _email, _hasher,
                TestMapper.Create(),
                NullLogger<AuthService>.Instance,
                new UserCreateDtoValidator(),
                new UserLoginDtoValidator(),
                new ChangePasswordDtoValidator(),
                new ForgotPasswordDtoValidator(),
                new ResetPasswordDtoValidator());
        }

        private static string Sha256Hex(string value) =>
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

        [Fact]
        public async Task Register_Throws_Conflict_WhenEmailAlreadyUsed()
        {
            _users.GetByEmailAsync("a@b.com", Arg.Any<CancellationToken>()).Returns(new User { Email = "a@b.com" });

            var act = () => _sut.RegisterAsync(new UserCreateDto("a@b.com", "password123", "A"));

            await act.Should().ThrowAsync<ConflictException>();
            await _users.DidNotReceive().CreateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Register_Throws_ValidationException_ForWeakPassword()
        {
            var act = () => _sut.RegisterAsync(new UserCreateDto("a@b.com", "short", "A"));

            await act.Should().ThrowAsync<ValidationException>();
        }

        [Fact]
        public async Task Register_HashesPassword_BeforePersisting()
        {
            _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);
            _users.CreateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(ci => ci.Arg<User>());

            await _sut.RegisterAsync(new UserCreateDto("a@b.com", "password123", "A"));

            await _users.Received(1).CreateAsync(
                Arg.Is<User>(u => u.HashedPassword == "hashed:password123"),
                Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Login_Throws_Unauthorized_WhenUserMissing()
        {
            _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);

            var act = () => _sut.LoginAsync(new UserLoginDto("a@b.com", "password123"));

            await act.Should().ThrowAsync<UnauthorizedException>();
        }

        [Fact]
        public async Task Login_Throws_Unauthorized_WhenPasswordWrong()
        {
            _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                  .Returns(new User { Email = "a@b.com", HashedPassword = "hashed:other" });

            var act = () => _sut.LoginAsync(new UserLoginDto("a@b.com", "password123"));

            await act.Should().ThrowAsync<UnauthorizedException>();
        }

        [Fact]
        public async Task Login_Throws_Unauthorized_ForGoogleOnlyAccount()
        {
            _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                  .Returns(new User { Email = "a@b.com", HashedPassword = null });

            var act = () => _sut.LoginAsync(new UserLoginDto("a@b.com", "password123"));

            await act.Should().ThrowAsync<UnauthorizedException>();
        }

        [Fact]
        public async Task Login_ReturnsToken_ForValidCredentials()
        {
            _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                  .Returns(new User { Email = "a@b.com", HashedPassword = "hashed:password123" });

            var token = await _sut.LoginAsync(new UserLoginDto("a@b.com", "password123"));

            token.Should().Be("jwt-token");
        }

        [Fact]
        public async Task ForgotPassword_DoesNothing_WhenUserUnknown()
        {
            _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);

            await _sut.ForgotPasswordAsync(new ForgotPasswordDto("ghost@b.com"));

            await _email.DidNotReceiveWithAnyArgs().SendPasswordResetEmailAsync(default!, default!, default);
            await _users.DidNotReceiveWithAnyArgs().UpdateAsync(default!, default);
        }

        [Fact]
        public async Task ForgotPassword_StoresOnlyHashOfToken_AndEmailsRawToken()
        {
            var user = new User { Email = "a@b.com" };
            _users.GetByEmailAsync("a@b.com", Arg.Any<CancellationToken>()).Returns(user);

            await _sut.ForgotPasswordAsync(new ForgotPasswordDto("a@b.com"));

            var emailCall = _email.ReceivedCalls().Single();
            var rawToken = (string)emailCall.GetArguments()[1]!;

            rawToken.Should().NotBeNullOrWhiteSpace();
            user.ResetPasswordToken.Should().NotBe(rawToken);
            user.ResetPasswordToken.Should().Be(Sha256Hex(rawToken));
            user.ResetPasswordTokenExpiry.Should().BeAfter(DateTime.UtcNow);
        }

        [Fact]
        public async Task ResetPassword_LooksUpByHashedToken_AndClearsIt()
        {
            var user = new User
            {
                Email = "a@b.com",
                ResetPasswordToken = Sha256Hex("raw-token"),
                ResetPasswordTokenExpiry = DateTime.UtcNow.AddMinutes(10)
            };
            _users.GetByResetTokenAsync(Sha256Hex("raw-token"), Arg.Any<CancellationToken>()).Returns(user);

            await _sut.ResetPasswordAsync(new ResetPasswordDto("raw-token", "newpassword1"));

            user.HashedPassword.Should().Be("hashed:newpassword1");
            user.ResetPasswordToken.Should().BeNull();
            user.ResetPasswordTokenExpiry.Should().BeNull();
        }

        [Fact]
        public async Task ResetPassword_Throws_WhenTokenExpired()
        {
            var user = new User { ResetPasswordTokenExpiry = DateTime.UtcNow.AddMinutes(-1) };
            _users.GetByResetTokenAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(user);

            var act = () => _sut.ResetPasswordAsync(new ResetPasswordDto("raw-token", "newpassword1"));

            await act.Should().ThrowAsync<UnauthorizedException>();
        }

        [Fact]
        public async Task ResetPassword_Throws_WhenTokenUnknown()
        {
            _users.GetByResetTokenAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);

            var act = () => _sut.ResetPasswordAsync(new ResetPasswordDto("raw-token", "newpassword1"));

            await act.Should().ThrowAsync<UnauthorizedException>();
        }

        [Fact]
        public async Task ChangePassword_Throws_ForGoogleOnlyAccount()
        {
            _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                  .Returns(new User { HashedPassword = null });

            var act = () => _sut.ChangePasswordAsync("a@b.com", new ChangePasswordDto("old", "newpassword1"));

            await act.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task ChangePassword_Throws_WhenOldPasswordWrong()
        {
            _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                  .Returns(new User { HashedPassword = "hashed:actual" });

            var act = () => _sut.ChangePasswordAsync("a@b.com", new ChangePasswordDto("wrong", "newpassword1"));

            await act.Should().ThrowAsync<UnauthorizedException>();
        }

        [Fact]
        public async Task GoogleLogin_CreatesUser_WhenNeitherGoogleIdNorEmailKnown()
        {
            _users.GetByGoogleIdAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);
            _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);
            _users.CreateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).Returns(ci => ci.Arg<User>());

            var token = await _sut.GoogleLoginAsync("a@b.com", "A", "gid", null);

            token.Should().Be("jwt-token");
            await _users.Received(1).CreateAsync(Arg.Is<User>(u => u.GoogleProviderId == "gid"), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task GoogleLogin_LinksGoogleId_ToExistingEmailAccount()
        {
            var existing = new User { Email = "a@b.com" };
            _users.GetByGoogleIdAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);
            _users.GetByEmailAsync("a@b.com", Arg.Any<CancellationToken>()).Returns(existing);

            await _sut.GoogleLoginAsync("a@b.com", "A", "gid", "http://pic");

            existing.GoogleProviderId.Should().Be("gid");
            existing.ProfileImageUrl.Should().Be("http://pic");
            await _users.DidNotReceive().CreateAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        }
    }
}
