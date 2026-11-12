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
    public class DishServiceTests
    {
        private readonly IDishRepository _dishes = Substitute.For<IDishRepository>();
        private readonly ICollectionRepository _collections = Substitute.For<ICollectionRepository>();
        private readonly ICategoryRepository _categories = Substitute.For<ICategoryRepository>();
        private readonly ICacheService _cache = Substitute.For<ICacheService>();
        private readonly IImageStorageService _images = Substitute.For<IImageStorageService>();
        private readonly DishService _sut;
        private readonly Guid _owner = Guid.NewGuid();
        private readonly Guid _other = Guid.NewGuid();

        public DishServiceTests()
        {
            _sut = new DishService(
                _dishes, _collections, _categories, _cache,
                TestMapper.Create(), _images,
                NullLogger<DishService>.Instance,
                new CreateDishDtoValidator(),
                new UpdateDishDtoValidator());
        }

        private Dish NewDish(Guid createdBy) => new()
        {
            Id = Guid.NewGuid(),
            Name = "Dish",
            CategoryId = 1,
            Category = new Category { Id = 1, Name = "Main Course" },
            CreatedByUserId = createdBy
        };

        [Fact]
        public async Task GetById_Throws_NotFound_WhenMissing()
        {
            _dishes.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Dish?)null);

            var act = () => _sut.GetByIdAsync(Guid.NewGuid());

            await act.Should().ThrowAsync<NotFoundException>();
        }

        [Fact]
        public async Task Create_Throws_NotFound_WhenCollectionMissing()
        {
            _collections.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Collection?)null);

            var act = () => _sut.CreateAsync(new CreateDishDto("Dish", null, 1, Guid.NewGuid(), null), _owner);

            await act.Should().ThrowAsync<NotFoundException>();
        }

        [Fact]
        public async Task Create_Throws_Forbidden_WhenCollectionBelongsToAnotherUser()
        {
            var collection = new Collection { Id = Guid.NewGuid(), UserId = _other };
            _collections.GetByIdAsync(collection.Id, Arg.Any<CancellationToken>()).Returns(collection);

            var act = () => _sut.CreateAsync(new CreateDishDto("Dish", null, 1, collection.Id, null), _owner);

            await act.Should().ThrowAsync<ForbiddenException>();
            await _dishes.DidNotReceiveWithAnyArgs().CreateAsync(default!, default, default);
        }

        [Fact]
        public async Task Create_Throws_NotFound_WhenCategoryMissing()
        {
            var collection = new Collection { Id = Guid.NewGuid(), UserId = _owner };
            _collections.GetByIdAsync(collection.Id, Arg.Any<CancellationToken>()).Returns(collection);
            _categories.ExistsAsync(99, Arg.Any<CancellationToken>()).Returns(false);

            var act = () => _sut.CreateAsync(new CreateDishDto("Dish", null, 99, collection.Id, null), _owner);

            await act.Should().ThrowAsync<NotFoundException>();
        }

        [Fact]
        public async Task Create_Throws_ValidationException_ForBlankName()
        {
            var act = () => _sut.CreateAsync(new CreateDishDto("", null, 1, Guid.NewGuid(), null), _owner);

            await act.Should().ThrowAsync<FluentValidation.ValidationException>();
        }

        [Fact]
        public async Task Create_PersistsDish_SetsCreator_AndInvalidatesCache()
        {
            var collection = new Collection { Id = Guid.NewGuid(), UserId = _owner };
            _collections.GetByIdAsync(collection.Id, Arg.Any<CancellationToken>()).Returns(collection);
            _categories.ExistsAsync(1, Arg.Any<CancellationToken>()).Returns(true);
            _dishes.CreateAsync(Arg.Any<Dish>(), collection.Id, Arg.Any<CancellationToken>()).Returns(ci => ci.Arg<Dish>());
            _dishes.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns(ci => NewDish(_owner));

            await _sut.CreateAsync(new CreateDishDto("Dish", "Tasty", 1, collection.Id, null), _owner);

            await _dishes.Received(1).CreateAsync(
                Arg.Is<Dish>(d => d.CreatedByUserId == _owner && d.Name == "Dish"),
                collection.Id,
                Arg.Any<CancellationToken>());
            await _cache.Received(1).InvalidateUserCacheAsync(_owner, Arg.Any<CancellationToken>());
            await _images.DidNotReceiveWithAnyArgs().UploadImageAsync(default!, default!, default!, default, default);
        }

        [Fact]
        public async Task Update_Throws_Forbidden_WhenNotCreator()
        {
            var dish = NewDish(_other);
            _dishes.GetByIdAsync(dish.Id, Arg.Any<CancellationToken>()).Returns(dish);

            var act = () => _sut.UpdateAsync(dish.Id, new UpdateDishDto("New", null, 1, null), _owner);

            await act.Should().ThrowAsync<ForbiddenException>();
            await _dishes.DidNotReceiveWithAnyArgs().UpdateAsync(default!, default);
        }

        [Fact]
        public async Task Update_Throws_NotFound_WhenCategoryMissing()
        {
            var dish = NewDish(_owner);
            _dishes.GetByIdAsync(dish.Id, Arg.Any<CancellationToken>()).Returns(dish);
            _categories.ExistsAsync(42, Arg.Any<CancellationToken>()).Returns(false);

            var act = () => _sut.UpdateAsync(dish.Id, new UpdateDishDto("New", null, 42, null), _owner);

            await act.Should().ThrowAsync<NotFoundException>();
        }

        [Fact]
        public async Task Update_AppliesChanges_ForCreator()
        {
            var dish = NewDish(_owner);
            _dishes.GetByIdAsync(dish.Id, Arg.Any<CancellationToken>()).Returns(dish);
            _categories.ExistsAsync(2, Arg.Any<CancellationToken>()).Returns(true);

            await _sut.UpdateAsync(dish.Id, new UpdateDishDto("Renamed", "Desc", 2, null), _owner);

            dish.Name.Should().Be("Renamed");
            dish.Description.Should().Be("Desc");
            dish.CategoryId.Should().Be(2);
            await _dishes.Received(1).UpdateAsync(dish, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Delete_Throws_Forbidden_WhenNotCreator()
        {
            var dish = NewDish(_other);
            _dishes.GetByIdAsync(dish.Id, Arg.Any<CancellationToken>()).Returns(dish);

            var act = () => _sut.DeleteAsync(dish.Id, _owner);

            await act.Should().ThrowAsync<ForbiddenException>();
            await _dishes.DidNotReceiveWithAnyArgs().DeleteAsync(default, default);
        }

        [Fact]
        public async Task Delete_Throws_NotFound_WhenMissing()
        {
            _dishes.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Dish?)null);

            var act = () => _sut.DeleteAsync(Guid.NewGuid(), _owner);

            await act.Should().ThrowAsync<NotFoundException>();
        }

        [Fact]
        public async Task Delete_Removes_ForCreator()
        {
            var dish = NewDish(_owner);
            _dishes.GetByIdAsync(dish.Id, Arg.Any<CancellationToken>()).Returns(dish);

            await _sut.DeleteAsync(dish.Id, _owner);

            await _dishes.Received(1).DeleteAsync(dish.Id, Arg.Any<CancellationToken>());
            await _cache.Received(1).InvalidateUserCacheAsync(_owner, Arg.Any<CancellationToken>());
        }
    }
}
