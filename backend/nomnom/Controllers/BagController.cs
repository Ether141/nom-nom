using BlinkDatabase.General;
using BlinkHttp.Http;
using BlinkHttp.Logging;
using nomnom.DataTransferObjects;
using nomnom.Extensions;
using nomnom.Mapping;
using nomnom.Models;

namespace nomnom.Controllers;

[Authorize]
[Route("bag")]
internal class BagController : Controller
{
    private readonly IRepository<Bag> bagRepository;
    private readonly IRepository<BagProduct> bagProductsRepository;
    private readonly IRepository<Restaurant> restaurantRepository;
    private readonly IRepository<Product> productsRepository;
    private readonly ILogger logger;

    public BagController(IRepository<Bag> bagRepository, IRepository<BagProduct> bagProductsRepository, IRepository<Restaurant> restaurantRepository, IRepository<Product> productsRepository, ILogger logger)
    {
        this.bagRepository = bagRepository;
        this.bagProductsRepository = bagProductsRepository;
        this.restaurantRepository = restaurantRepository;
        this.productsRepository = productsRepository;
        this.logger = logger;
    }

    [HttpPost("{restaurantId}")]
    public IHttpResult GetBagForUser([FromQuery] int restaurantId)
    {
        int userId = User!.GetId();
        logger.Info($"GetBagForUser called for userId={userId}, restaurantId={restaurantId}");
        Bag? bag = bagRepository.SelectSingle(b => b.User.Id == userId && b.RestaurantId == restaurantId);

        if (bag == null)
        {
            logger.Warning($"Bag not found for userId={userId}, restaurantId={restaurantId}");
            return NotFound();
        }

        BagDTO dto = new BagMapper().Map(bag);
        logger.Info($"Bag found and mapped for userId={userId}, restaurantId={restaurantId}, bagId={bag.Id}");
        return JsonResult.FromObject(dto);
    }

    [HttpDelete("{restaurantId}")]
    public IHttpResult DeleteBag([FromQuery] int restaurantId)
    {
        int userId = User!.GetId();
        logger.Info($"DeleteBag called for userId={userId}, restaurantId={restaurantId}");
        bool deleted = bagRepository.Delete(b => b.RestaurantId == restaurantId && b.User.Id == userId) > 0;

        if (deleted)
        {
            logger.Info($"Bag deleted for userId={userId}, restaurantId={restaurantId}");
        }
        else
        {
            logger.Warning($"No bag found to delete for userId={userId}, restaurantId={restaurantId}");
        }

        return deleted ? Ok() : NotFound();
    }

    [HttpPost("update/{restaurantId}")]
    public IHttpResult UpdateBag([FromQuery] int restaurantId, [FromBody] int[] productIds)
    {
        int userId = User!.GetId();
        logger.Info($"UpdateBag called for userId={userId}, restaurantId={restaurantId}, productIds=[{string.Join(",", productIds)}]");

        if (!restaurantRepository.Exists(r => r.Id == restaurantId))
        {
            logger.Warning($"Restaurant with id={restaurantId} does not exist.");
            return JsonResult.FromObject(new { Message = "Restaurant with given ID does not exist." }, System.Net.HttpStatusCode.BadRequest);
        }

        int bagId = CreateBagIfNotExist(userId, restaurantId);
        logger.Info($"Bag ensured for userId={userId}, restaurantId={restaurantId}, bagId={bagId}");

        foreach (int productId in productIds)
        {
            if (!productsRepository.Exists(p => p.Id == productId && p.Restaurant.Id == restaurantId))
            {
                logger.Warning($"Product with id={productId} does not exist or is not associated with restaurantId={restaurantId}");
                return JsonResult.FromObject(new { Message = $"Product with given ID {productId} does not exist or it is not associated with selected restaurant." }, System.Net.HttpStatusCode.BadRequest);
            }
        }

        Bag bag = bagRepository.SelectSingle(b => b.Id == bagId)!;
        bagProductsRepository.Delete(p => p.Bag.Id == bagId);
        logger.Info($"Existing products removed from bagId={bagId}");

        foreach (int productId in productIds)
        {
            bagProductsRepository.Insert(new BagProduct { Product = new() { Id = productId }, Bag = new() { Id = bagId } });
            logger.Info($"Product with id={productId} added to bagId={bagId}");
        }

        logger.Info($"Bag updated for userId={userId}, restaurantId={restaurantId}, bagId={bagId}");

        if (productIds.Length == 0)
        {
            DeleteBag(restaurantId);
        }

        return Ok();
    }

    private int CreateBagIfNotExist(int userId, int restaurantId)
    {
        Bag? bag = bagRepository.SelectSingle(b => b.User.Id == userId && b.RestaurantId == restaurantId);

        if (bag == null)
        {
            bag = new Bag { User = new() { Id = userId }, RestaurantId = restaurantId };
            bagRepository.Insert(bag);
            logger.Info($"New bag created for userId={userId}, restaurantId={restaurantId}, bagId={bag.Id}");
        }
        else
        {
            logger.Info($"Bag already exists for userId={userId}, restaurantId={restaurantId}, bagId={bag.Id}");
        }

        return bag.Id;
    }
}
