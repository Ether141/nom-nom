using nomnom.DataTransferObjects;
using nomnom.Models;

namespace nomnom.Mapping;

internal class RestaurantUpdateMapper : IMapper<RestaurantUpdateDTO, Restaurant>
{
    public Restaurant Map(RestaurantUpdateDTO from) => new Restaurant
    {
        Name = from.Name,
        Tags = from.Tags,
        DeliveryPrice = from.DeliveryPrice,
        DeliveryTime = from.DeliveryTime,
        MinimalPriceForDelivery = from.MinimalPriceForDelivery
    };

    public RestaurantUpdateDTO ReverseMap(Restaurant from) => throw new NotImplementedException();
}
