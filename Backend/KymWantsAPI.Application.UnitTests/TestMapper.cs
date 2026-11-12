using KymWantsAPI.Application.Services;
using Mapster;
using MapsterMapper;

namespace KymWantsAPI.Application.UnitTests
{
    internal static class TestMapper
    {
        public static IMapper Create()
        {
            var config = new TypeAdapterConfig();
            config.Scan(typeof(ApplicationServiceContainer).Assembly);
            return new Mapper(config);
        }
    }
}
