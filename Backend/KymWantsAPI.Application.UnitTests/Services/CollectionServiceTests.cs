using FluentAssertions;
using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Application.Exceptions;
using KymWantsAPI.Application.Interfaces;
using KymWantsAPI.Application.Services;
using KymWantsAPI.Application.Validators;
using KymWantsAPI.Domain.Models;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using Xunit;

namespace KymWantsAPI.Application.UnitTests.Services
{
    public class CollectionServiceTests
    {
        private readonly ICollectionRepository _repo = Substitute.For<ICollectionRepository>();
        private readonly ICacheService _cache = Substitute.For<ICacheService>();
        private readonly CollectionService _sut;
        private readonly Guid _owner = Guid.NewGuid();
        private readonly Guid _other = Guid.NewGuid();

        public CollectionServiceTests()
        {
            _sut = new CollectionService(
                _repo, TestMapper.Create(), _cache,
                NullLogger<CollectionService>.Instance,
                new CreateCollectionDtoValidator(),
                new UpdateCollectionDtoValidator());
        }

        private Collection NewCollection(bool shared = false) => new()
        {
            Id = Guid.NewGuid(),
            Name = "C",
            IsShared = shared,
            UserId = _owner,
            User = new User { Id = _owner, DisplayName = "Owner" }
        };

        [Fact]
        public async Task GetById_Throws_NotFound_WhenMissing()
        {
            _repo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Collection?)null);

            var act = () => _sut.GetByIdAsync(Guid.NewGuid(), _owner);

            await act.Should().ThrowAsync<NotFoundException>();
        }

        [Fact]
        public async Task GetById_Throws_Forbidden_ForPrivateCollectionOfAnotherUser()
        {
            var c = NewCollection(shared: false);
            _repo.GetByIdAsync(c.Id, Arg.Any<CancellationToken>()).Returns(c);

            var act = () => _sut.GetByIdAsync(c.Id, _other);

            await act.Should().ThrowAsync<ForbiddenException>();
        }

        [Fact]
        public async Task GetById_AllowsOtherUser_WhenCollectionIsShared()
        {
            var c = NewCollection(shared: true);
            _repo.GetByIdAsync(c.Id, Arg.Any<CancellationToken>()).Returns(c);

            var result = await _sut.GetByIdAsync(c.Id, _other);

            result.Id.Should().Be(c.Id);
        }

        [Fact]
        public async Task Update_Throws_Forbidden_WhenNotOwner()
        {
            var c = NewCollection();
            _repo.GetByIdAsync(c.Id, Arg.Any<CancellationToken>()).Returns(c);

            var act = () => _sut.UpdateAsync(c.Id, new UpdateCollectionDto("New", true), _other);

            await act.Should().ThrowAsync<ForbiddenException>();
            await _repo.DidNotReceive().UpdateAsync(Arg.Any<Collection>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Update_Throws_NotFound_WhenMissing()
        {
            _repo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Collection?)null);

            var act = () => _sut.UpdateAsync(Guid.NewGuid(), new UpdateCollectionDto("New", null), _owner);

            await act.Should().ThrowAsync<NotFoundException>();
        }

        [Fact]
        public async Task Update_AppliesChanges_AndInvalidatesCache_ForOwner()
        {
            var c = NewCollection();
            _repo.GetByIdAsync(c.Id, Arg.Any<CancellationToken>()).Returns(c);

            await _sut.UpdateAsync(c.Id, new UpdateCollectionDto("Renamed", true), _owner);

            c.Name.Should().Be("Renamed");
            c.IsShared.Should().BeTrue();
            await _repo.Received(1).UpdateAsync(c, Arg.Any<CancellationToken>());
            await _cache.Received(1).InvalidateUserCacheAsync(_owner, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Update_KeepsIsShared_WhenNotProvided()
        {
            var c = NewCollection(shared: true);
            _repo.GetByIdAsync(c.Id, Arg.Any<CancellationToken>()).Returns(c);

            await _sut.UpdateAsync(c.Id, new UpdateCollectionDto("Renamed", null), _owner);

            c.IsShared.Should().BeTrue();
        }

        [Fact]
        public async Task Delete_Throws_Forbidden_WhenNotOwner()
        {
            var c = NewCollection();
            _repo.GetByIdAsync(c.Id, Arg.Any<CancellationToken>()).Returns(c);

            var act = () => _sut.DeleteAsync(c.Id, _other);

            await act.Should().ThrowAsync<ForbiddenException>();
            await _repo.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Delete_RemovesAndInvalidatesCache_ForOwner()
        {
            var c = NewCollection();
            _repo.GetByIdAsync(c.Id, Arg.Any<CancellationToken>()).Returns(c);

            await _sut.DeleteAsync(c.Id, _owner);

            await _repo.Received(1).DeleteAsync(c.Id, Arg.Any<CancellationToken>());
            await _cache.Received(1).InvalidateUserCacheAsync(_owner, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Create_SetsOwner_AndInvalidatesCache()
        {
            _repo.CreateAsync(Arg.Any<Collection>(), Arg.Any<CancellationToken>()).Returns(ci => ci.Arg<Collection>());
            _repo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
                 .Returns(ci => new Collection { Id = ci.Arg<Guid>(), Name = "C", UserId = _owner, User = new User { DisplayName = "Owner" } });

            await _sut.CreateAsync(new CreateCollectionDto("C", null), _owner);

            await _repo.Received(1).CreateAsync(
                Arg.Is<Collection>(c => c.UserId == _owner && c.Name == "C" && !c.IsShared),
                Arg.Any<CancellationToken>());
            await _cache.Received(1).InvalidateUserCacheAsync(_owner, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task GetMyCollections_ReturnsCached_WithoutHittingRepository()
        {
            var cached = new List<CollectionResponseDto>
            {
                new(Guid.NewGuid(), "Cached", false, "Owner", new List<DishResponseDto>())
            };
            _cache.GetAsync<List<CollectionResponseDto>>($"collection_{_owner}", Arg.Any<CancellationToken>()).Returns(cached);

            var result = await _sut.GetMyCollectionsAsync(_owner);

            result.Should().BeSameAs(cached);
            await _repo.DidNotReceive().GetAllByUserAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task GetMyCollections_FallsBackToRepository_WhenCacheThrows()
        {
            _cache.GetAsync<List<CollectionResponseDto>>(Arg.Any<string>(), Arg.Any<CancellationToken>())
                  .Returns<List<CollectionResponseDto>?>(_ => throw new InvalidOperationException("redis down"));
            _repo.GetAllByUserAsync(_owner, Arg.Any<CancellationToken>()).Returns(new List<Collection> { NewCollection() });

            var result = await _sut.GetMyCollectionsAsync(_owner);

            result.Should().HaveCount(1);
        }
    }
}
