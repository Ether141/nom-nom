using nomnom.DataTransferObjects;
using nomnom.Models;

namespace nomnom.Mapping;

internal class BagMapper : IMapper<Bag, BagDTO>
{
    public BagDTO Map(Bag from) => new BagDTO
    {
        Id = from.Id,
        UserId = from.User.Id,
        RestaurantId = from.RestaurantId,
        Products = [.. new ProductMapper().MapCollection(from.Products.Select(p => p.Product))]
    };

    public Bag ReverseMap(BagDTO from) => throw new NotImplementedException();
}
