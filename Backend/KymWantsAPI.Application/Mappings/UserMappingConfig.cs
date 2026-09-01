

using KymWantsAPI.Application.DTOs;
using KymWantsAPI.Domain.Models;
using Mapster;

namespace KymWantsAPI.Application.Mappings
{
    public class UserMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<User, UserReadDto>().IgnoreNullValues(true);
            config.NewConfig<User, UserCreateDto>().IgnoreNullValues(true);
            config.NewConfig<UserUpdateDto, User>()
                              .IgnoreNullValues(true)
                              .Ignore(dest => dest.ProfileImageUrl);
    }
    }
}
