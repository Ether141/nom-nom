using BlinkDatabase.General;
using BlinkHttp.Http;
using BlinkHttp.Logging;
using nomnom.DataTransferObjects;
using nomnom.Extensions;
using nomnom.Mapping;
using nomnom.Models;

namespace nomnom.Controllers;

[Authorize]
[Route("order")]
internal class OrderController : Controller
{
    private readonly IRepository<Restaurant> restaurantRepository;
    private readonly IRepository<Order> orderRepository;
    private readonly IRepository<OrderProduct> orderProductRepository;
    private readonly IRepository<Bag> bagRepository;
    private readonly IRepository<User> userRepository;

    private readonly ILogger logger;

    public OrderController(IRepository<Restaurant> restaurantRepository,
                           IRepository<Order> orderRepository,
                           IRepository<OrderProduct> orderProductRepository,
                           IRepository<Bag> bagRepository,
                           IRepository<User> userRepository,
                           ILogger logger)
    {
        this.restaurantRepository = restaurantRepository;
        this.orderRepository = orderRepository;
        this.orderProductRepository = orderProductRepository;
        this.bagRepository = bagRepository;
        this.userRepository = userRepository;

        this.logger = logger;
    }

    [HttpPost("get/{orderId}")]
    public IHttpResult Get([FromQuery] int orderId)
    {
        int userId = User!.GetId();
        logger.Debug($"Get order request received. UserId: {userId}, OrderId: {orderId}");
        Order? order = orderRepository.SelectSingle(x => x.Id == orderId && x.User.Id == userId);

        if (order == null)
        {
            logger.Warning($"Order not found. UserId: {userId}, OrderId: {orderId}");
            return NotFound();
        }

        logger.Info($"Order retrieved successfully. OrderId: {order.Id} for UserId: {userId}");
        return JsonResult.FromObject(new OrderMapper().Map(order));
    }

    [HttpPost("getall")]
    public IHttpResult GetAll()
    {
        int userId = User!.GetId();
        logger.Debug($"GetAll orders request received for UserId: {userId}");
        IEnumerable<Order> orders = orderRepository.Select(o => o.User.Id == userId);
        logger.Info($"Retrieved {orders.Count()} orders for UserId: {userId}");
        return JsonResult.FromObject(new OrderMapper().MapCollection(orders));
    }

    [HttpPost("place")]
    public IHttpResult PlaceOrder([FromBody] PlaceOrderDTO dto)
    {
        int userId = User!.GetId();
        logger.Debug($"PlaceOrder request received. UserId: {userId}, RestaurantId: {dto.RestaurantId}");
        Restaurant? restaurant = restaurantRepository.SelectSingle(r => r.Id == dto.RestaurantId);

        if (restaurant == null)
        {
            logger.Warning($"Restaurant with id={dto.RestaurantId} does not exist. UserId: {userId}");
            return JsonResult.FromObject(new { Message = "Restaurant with given ID does not exist." },
                                           System.Net.HttpStatusCode.BadRequest);
        }

        foreach (int productId in dto.Products)
        {
            if (!restaurant.Products!.Any(p => p.Id == productId))
            {
                logger.Warning($"Invalid product id {productId} for RestaurantId: {dto.RestaurantId}. UserId: {userId}");
                return JsonResult.FromObject(new { Message = $"At least one of the given product IDs is invalid." }, System.Net.HttpStatusCode.BadRequest);
            }
        }

        User user = userRepository.SelectSingle(u => u.Id == userId)!;
        decimal totalPrice = restaurant.DeliveryPrice + dto.Products.Sum(p => restaurant.Products!.First(x => x.Id == p).Price);
        logger.Debug($"Calculated totalPrice: {totalPrice} for UserId: {userId}");

        if (user.Balance < totalPrice)
        {
            logger.Error($"Insufficient balance for UserId: {userId}. Balance: {user.Balance}, Required: {totalPrice}");
            return BadRequest();
        }

        Order order = CreateOrder(userId, dto, totalPrice);
        orderRepository.Insert(order);
        logger.Info($"Order created with Id: {order.Id} for UserId: {userId}");

        IEnumerable<OrderProduct> orderProducts = dto.Products.Select(p => new OrderProduct() { Order = order, ProductId = p });
        foreach (OrderProduct product in orderProducts)
        {
            orderProductRepository.Insert(product);
            logger.Debug($"Inserted OrderProduct. OrderId: {order.Id}, ProductId: {product.ProductId}");
        }

        bagRepository.Delete(b => b.RestaurantId == dto.RestaurantId && b.User.Id == userId);
        logger.Debug($"Cleared bag items for RestaurantId: {dto.RestaurantId} and UserId: {userId}");

        user.Balance -= totalPrice;
        userRepository.Update(user);
        logger.Info($"Updated User balance. UserId: {userId}, New Balance: {user.Balance}");

        logger.Info($"PlaceOrder completed successfully for OrderId: {order.Id}");
        return JsonResult.FromObject(new { order.Id });
    }

    private static Order CreateOrder(int userId, PlaceOrderDTO dto, decimal totalPrice) => new Order()
    {
        User = new User() { Id = userId },
        Restaurant = new Restaurant() { Id = dto.RestaurantId },
        PlaceDate = DateTime.Now,
        Comment = dto.Comment,
        Status = OrderStatus.WaitingForAccept,
        TotalPrice = totalPrice,
        DeliveryTime = -1
    };
}
