using nomnom.DataTransferObjects;
using nomnom.Models;

namespace nomnom.Mapping;

internal class OrderMapper : IMapper<Order, OrderDTO>, ICollectionMapper<Order, OrderDTO>
{
    public OrderDTO Map(Order from) =>
        new OrderDTO()
        {
            Id = from.Id,
            RestaurantId = from.Restaurant.Id,
            PlaceDate = from.PlaceDate,
            Comment = from.Comment,
            Products = [.. from.Products.Select(p => p.ProductId)],
            Status = from.Status,
            DeliveryTime = from.DeliveryTime,
            TotalPrice = from.TotalPrice
        };

    public IEnumerable<OrderDTO> MapCollection(IEnumerable<Order> from) => from.Select(o => Map(o));

    public Order ReverseMap(OrderDTO from) => throw new NotImplementedException();

    public IEnumerable<Order> ReverseMapCollection(IEnumerable<OrderDTO> from) => throw new NotImplementedException();
}
