

using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Domain.Models;
using Mapster;

namespace KymWantsAPI.Application.Mappings
{
    public class CollectionMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Collection, CollectionResponseDto>()
                  .Map(dest => dest.UserName, src => src.User != null ? src.User.DisplayName : string.Empty)
                  .Map(dest => dest.Dishes, src => src.CollectionDishes.Select(cd => cd.Dish));

            config.NewConfig<CreateCollectionDto, Collection>()
                  .Map(dest => dest.IsShared, src => src.IsShared ?? false);
        }
    }
    public class DishMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Dish, DishResponseDto>()
                  .Map(dest => dest.CategoryName, src => src.Category != null ? src.Category.Name : string.Empty);

            config.NewConfig<CreateDishDto, Dish>()
                .Map(des => des.CategoryId, src => src.CategoryId)
               .Ignore(dest => dest.ProfileImageUrl);

            config.NewConfig<UpdateDishDto, Dish>()
                .Ignore(dest => dest.ProfileImageUrl);
        }
    }
}
