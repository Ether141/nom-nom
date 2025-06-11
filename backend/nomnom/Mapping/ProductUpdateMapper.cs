using nomnom.DataTransferObjects;
using nomnom.Models;

namespace nomnom.Mapping;

internal class ProductUpdateMapper : IMapper<ProductUpdateDTO, Product>
{
    public Product Map(ProductUpdateDTO from) => new Product
    {
        Name = from.Name,
        Description = from.Description,
        Category = from.Category,
        Price = from.Price
    };

    public ProductUpdateDTO ReverseMap(Product from) => throw new NotImplementedException();
}
