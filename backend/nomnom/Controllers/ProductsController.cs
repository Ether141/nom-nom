using BlinkDatabase.General;
using BlinkHttp.Http;
using nomnom.Mapping;
using nomnom.Models;

namespace nomnom.Controllers;

[Route("product")]
public class ProductsController : Controller
{
    private readonly IRepository<Product> productsRepository;

    public ProductsController(IRepository<Product> productsRepository)
    {
        this.productsRepository = productsRepository;
    }

    [HttpGet("all/{restaurantId}")]
    public IHttpResult GetAll([FromQuery] int restaurantId)
    {
        IEnumerable<Product> products = productsRepository.Select(p => p.Restaurant!.Id == restaurantId);

        if (!products.Any())
        {
            return NotFound();
        }

        return JsonResult.FromObject(new ProductMapper().MapCollection(products));
    }

    [HttpGet("categories/{restaurantId}")]
    public IHttpResult GetCategories([FromQuery] int restaurantId)
    {
        IEnumerable<Product> products = productsRepository.Select(p => p.Restaurant!.Id == restaurantId);

        if (!products.Any())
        {
            return NotFound();
        }

        IEnumerable<string> categories = products.Select(p => p.Category).Distinct();
        return JsonResult.FromObject(categories);
    }
}
