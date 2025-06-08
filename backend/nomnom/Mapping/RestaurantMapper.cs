using nomnom.DataTransferObjects;
using nomnom.Models;

namespace nomnom.Mapping;

internal class RestaurantMapper : IMapper<Restaurant, RestaurantDTO>, ICollectionMapper<Restaurant, RestaurantDTO>
{
    public RestaurantDTO Map(Restaurant from) => new RestaurantDTO()
    {
        Id = from.Id,
        Name = from.Name,
        Opinion = from.Opinion,
        OpinionNumber = from.OpinionNumber,
        Tags = from.Tags,
        BannerPath = from.BannerPath,
        DeliveryPrice = from.DeliveryPrice,
        MinimalPriceForDelivery = from.MinimalPriceForDelivery,
        DeliveryTime = from.DeliveryTime,
        Address = from.Address.Address
    };

    public Restaurant ReverseMap(RestaurantDTO from) => throw new NotImplementedException();

    public IEnumerable<RestaurantDTO> MapCollection(IEnumerable<Restaurant> from) => from.Select(Map);

    public IEnumerable<Restaurant> ReverseMapCollection(IEnumerable<RestaurantDTO> from) => throw new NotImplementedException();
}
