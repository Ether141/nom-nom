using nomnom.DataTransferObjects;
using nomnom.Models;

namespace nomnom.Mapping;

internal class ProductMapper : IMapper<Product, ProductDTO>, ICollectionMapper<Product, ProductDTO>
{
    public ProductDTO Map(Product from) => new ProductDTO()
    {
        Id = from.Id,
        Name = from.Name,
        Price = from.Price,
        Description = from.Description,
        RestaurantId = from.Restaurant.Id,
        Category = from.Category
    };

    public IEnumerable<ProductDTO> MapCollection(IEnumerable<Product> from)
    {
        List<ProductDTO> result = [];

        foreach (Product item in from)
        {
            result.Add(Map(item));
        }

        return result;
    }

    public Product ReverseMap(ProductDTO from) => throw new NotImplementedException();

    public IEnumerable<Product> ReverseMapCollection(IEnumerable<ProductDTO> from) => throw new NotImplementedException();
}
