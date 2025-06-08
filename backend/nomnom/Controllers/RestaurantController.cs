using BlinkDatabase.General;
using BlinkHttp.Configuration;
using BlinkHttp.Http;
using BlinkHttp.Logging;
using nomnom.Content;
using nomnom.Location;
using nomnom.Mapping;
using nomnom.Models;

namespace nomnom.Controllers;

[Route("restaurant")]
internal class RestaurantController : Controller
{
    private readonly IFilesProvider filesProvider;
    private readonly LocationService locationService;
    private readonly IRepository<Restaurant> restaurantRepo;

    private readonly ILogger logger;

    private readonly double maximalDistance;

    public RestaurantController(IFilesProvider filesProvider, LocationService locationService, IRepository<Restaurant> restaurantRepo, IConfiguration configuration, ILogger logger)
    {
        this.filesProvider = filesProvider;
        this.locationService = locationService;
        this.restaurantRepo = restaurantRepo;
        this.logger = logger;

        maximalDistance = configuration.Get<double>("nomnom:maximal_distance");
    }

    [HttpGet("get/{id}")]
    public IHttpResult Get([FromQuery] int id)
    {
        Restaurant? restaurant = restaurantRepo.SelectSingle(x => x.Id == id);
        return restaurant != null ? JsonResult.FromObject(new RestaurantMapper().Map(restaurant)) : NotFound();
    }

    [HttpGet("all?address={address}&phrase={phrase}&sort={sort}")]
    public async Task<IHttpResult> All([FromQuery] string address, [FromQuery, Optional] string? phrase, [FromQuery, Optional] int? sort)
    {
        logger.Info($"Got request about list of restaurants for address: {address}");
        IEnumerable<Restaurant> restaurants = restaurantRepo.Select();

        restaurants = await FilterByAddress(restaurants, address);
        restaurants = Filter(restaurants, phrase);

        if (sort != null)
        {
            restaurants = Sort(restaurants, sort.Value); 
        }

        return JsonResult.FromObject(new RestaurantMapper().MapCollection(restaurants));
    }

    [HttpGet("banner/{id}")]
    public IHttpResult GetBanner([FromQuery] int id)
    {
        Restaurant? restaurant = restaurantRepo.SelectSingle(x => x.Id == id);

        if (restaurant == null)
        {
            return NotFound();
        }

        byte[]? file = filesProvider.LoadFile(restaurant.BannerPath);

        if (file == null)
        {
            return NotFound();
        }

        string mimeType = MimeTypes.GetMimeTypeForExtension(Path.GetExtension(restaurant.BannerPath)) ?? MimeTypes.ImageJpeg;
        return FileResult.Inline(file, mimeType);
    }

    private async Task<IEnumerable<Restaurant>> FilterByAddress(IEnumerable<Restaurant> restaurants, string address)
    {
        var restaurantCoordinates = await locationService.GetCoordinates(address);

        if (restaurantCoordinates == null)
        {
            return [];
        }

        (double latitude, double longitude) = restaurantCoordinates.Value;
        List<Restaurant> result = [];
        
        foreach (Restaurant restaurant in restaurants)
        {
            var a = (longitude, latitude);
            var b = ((double) restaurant.Address.Longitude, (double) restaurant.Address.Latitude);
            double distance = Math.Round(GeoMath.DistanceBetweenCoords(a, b) / 1000d, 1);

            if (distance <= maximalDistance)
            {
                result.Add(restaurant);
            }
        }

        return result;
    }

    private static IEnumerable<Restaurant> Filter(IEnumerable<Restaurant> restaurants, string? phrase)
    {
        if (string.IsNullOrWhiteSpace(phrase))
        {
            return restaurants;
        }

        string[] keywords = phrase.Split(' ', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

        if (keywords.Length == 0)
        {
            return restaurants;
        }

        HashSet<Restaurant> filtered = [];

        foreach (Restaurant restaurant in restaurants)
        {
            bool canAdd = true;

            foreach (string keyword in keywords)
            {
                if (!restaurant.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase) &&
                    !restaurant.Tags.Contains(keyword, StringComparison.OrdinalIgnoreCase) &&
                    !restaurant.Products!.Any(p => p.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
                {
                    canAdd = false;
                    break;
                }
            }

            if (canAdd)
            {
                filtered.Add(restaurant);
            }
        }

        return filtered;
    }

    private static IEnumerable<Restaurant> Sort(IEnumerable<Restaurant> restaurants, int sortBy)
    {
        if (sortBy < 0 || sortBy > 2)
        {
            return restaurants;
        }

        if (sortBy == 0)
        {
            return restaurants.OrderBy(r => r.Name);
        }
        else if (sortBy == 1)
        {
            return restaurants.OrderBy(r => r.OpinionNumber).Reverse();
        }
        else
        {
            return restaurants.OrderBy(r => r.Opinion).Reverse();
        }
    }
}
