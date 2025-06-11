using BlinkDatabase.General;
using BlinkHttp.Http;
using BlinkHttp.Logging;
using nomnom.Content;
using nomnom.DataTransferObjects;
using nomnom.Location;
using nomnom.Mapping;
using nomnom.Models;

namespace nomnom.Controllers;

[Route("management")]
[Authorize(roles: ["admin"])]
internal class ManagementController : Controller
{
    private readonly IRepository<Restaurant> restaurantRepository;
    private readonly IRepository<Product> productRepository;
    private readonly IRepository<RestaurantAddress> restaurantAddressRepository;

    private readonly ILocationService locationService;
    private readonly ILogger logger;
    private readonly IFilesProvider filesProvider;

    public ManagementController(IRepository<Restaurant> restaurantRepository, IRepository<Product> productRepository, IRepository<RestaurantAddress> restaurantAddressRepository, ILocationService locationService, ILogger logger, IFilesProvider filesProvider)
    {
        this.restaurantRepository = restaurantRepository;
        this.productRepository = productRepository;
        this.restaurantAddressRepository = restaurantAddressRepository;

        this.locationService = locationService;
        this.logger = logger;
        this.filesProvider = filesProvider;
    }

    [HttpPost("all")]
    public IHttpResult GetAllRestaurants()
    {
        return JsonResult.FromObject(restaurantRepository.Select().Select(r => new { r.Id, r.Name, r.Address.Address }));
    }

    [HttpPost("details/{restaurantId}")]
    public IHttpResult GetRestaurantDetails([FromQuery] int restaurantId)
    {
        Restaurant? restaurant = restaurantRepository.SelectSingle(r => r.Id == restaurantId);

        if (restaurant == null)
        {
            return NotFound();
        }

        IEnumerable<Product> products = productRepository.Select(p => p.Restaurant.Id == restaurantId);

        RestaurantDTO restaurantDTO = new RestaurantMapper().Map(restaurant);
        IEnumerable<ProductDTO> productDTOs = new ProductMapper().MapCollection(products);

        RestaurantDetailsDTO dto = new RestaurantDetailsDTO { Restaurant = restaurantDTO, Products = productDTOs };

        return JsonResult.FromObject(dto);
    }

    [HttpPost("update")]
    public async Task<IHttpResult> UpdateRestaurant([FromBody] RestaurantUpdateDTO updateDTO)
    {
        Restaurant? restaurant = restaurantRepository.SelectSingle(r => r.Id == updateDTO.Id);

        if (restaurant == null)
        {
            RestaurantAddress address = await CreateAddress(updateDTO.Address);
            restaurantAddressRepository.Insert(address);

            restaurant = new RestaurantUpdateMapper().Map(updateDTO);
            restaurant.Address = address;

            restaurantRepository.Insert(restaurant);

            restaurant.BannerPath = $"restaurants/banners/{restaurant.Id}.jpg";
            restaurantRepository.Update(restaurant);

            foreach (ProductUpdateDTO productDto in updateDTO.ProductUpdates)
            {
                Product product = new ProductUpdateMapper().Map(productDto);
                product.Restaurant = new Restaurant { Id = restaurant.Id };
                productRepository.Insert(product);
            }
        }
        else
        {
            if (restaurant.Address.Address != updateDTO.Address)
            {
                RestaurantAddress address = await CreateAddress(updateDTO.Address);
                address.Id = restaurant.Address.Id;

                restaurantAddressRepository.Update(address);
            }

            restaurant.Name = updateDTO.Name;
            restaurant.Tags = updateDTO.Tags;
            restaurant.DeliveryPrice = updateDTO.DeliveryPrice;
            restaurant.DeliveryTime = updateDTO.DeliveryTime;
            restaurant.MinimalPriceForDelivery = updateDTO.MinimalPriceForDelivery;

            foreach (ProductUpdateDTO productDto in updateDTO.ProductUpdates)
            {
                Product? product = productRepository.SelectSingle(p => p.Id == productDto.Id);

                if (product != null)
                {
                    product.Name = productDto.Name;
                    product.Description = productDto.Description;
                    product.Category = productDto.Category;
                    product.Price = productDto.Price;
                    productRepository.Update(product);
                }
                else
                {
                    product = new ProductUpdateMapper().Map(productDto);
                    product.Restaurant = new Restaurant { Id = restaurant.Id };
                    productRepository.Insert(product);
                }
            }

            restaurantRepository.Update(restaurant);
        }

        return JsonResult.FromObject(new { restaurant.Id });
    }

    [HttpPost("banner/{restaurantId}")]
    public IHttpResult ChangeBanner([FromQuery] int restaurantId, [FromBody] RequestFile file)
    {
        Restaurant? restaurant = restaurantRepository.SelectSingle(r => r.Id == restaurantId);

        if (restaurant == null)
        {
            return NotFound();
        }

        string ext = Path.GetExtension(file.FileName);
        string path = $"restaurants/banners/{restaurantId}{ext}";

        filesProvider.SaveFile(path, file.Data);

        if (restaurant.BannerPath != path)
        {
            restaurant.BannerPath = path;
            restaurantRepository.Update(restaurant);
        }
        
        return Ok();
    }

    [HttpDelete("{restaurantId}")]
    public IHttpResult DeleteRestaurant([FromQuery] int restaurantId)
    {
        Restaurant? restaurant = restaurantRepository.SelectSingle(r => r.Id == restaurantId);

        if (restaurant == null)
        {
            return NotFound();
        }

        int result = restaurantRepository.Delete(r => r.Id == restaurantId);
        return result == 0 ? InternalServerError() : Ok();
    }

    private async Task<RestaurantAddress> CreateAddress(string address)
    {
        (double latitude, double longitude)? coord = await locationService.GetCoordinates(address);

        // by default Warsaw coordinates
        decimal latitude = coord != null ? (decimal)coord.Value.latitude : 52.237049m;
        decimal longitude = coord != null ? (decimal)coord.Value.longitude : 21.017532m;

        return new RestaurantAddress { Address = address, Latitude = latitude, Longitude = longitude };
    }
}
