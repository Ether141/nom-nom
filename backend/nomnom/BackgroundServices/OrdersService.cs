using BlinkDatabase.General;
using BlinkHttp.Background;
using BlinkHttp.DependencyInjection;
using BlinkHttp.Logging;
using nomnom.Models;

namespace nomnom.BackgroundServices;

internal class OrdersService : IBackgroundService
{
    public bool IsRunning { get; private set; } = false;

    private IRepository<Order>? orderRepository;
    private IRepository<Restaurant>? restaurantRepository;

    private readonly ILogger logger = LoggerFactory.Create<OrdersService>();

    private readonly CancellationTokenSource cts = new();
    private readonly CancellationToken ct;

    public OrdersService()
    {
        ct = cts.Token;
    }

    public async Task StartAsync()
    {
        IsRunning = true;
        await Loop();
    }

    private async Task Loop()
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(5000, ct);
            }
            catch (TaskCanceledException)
            {
                break;
            }

            orderRepository ??= ServicesContainer.GetRepository<Order>();
            restaurantRepository ??= ServicesContainer.GetRepository<Restaurant>();

            IEnumerable<Order> orders = orderRepository.Select(o => o.Status != OrderStatus.Done);

            foreach (Order order in orders)
            {
                if (order.Status == OrderStatus.WaitingForAccept && order.PlaceDate.AddSeconds(15) <= DateTime.Now)
                {
                    Restaurant restaurant = restaurantRepository.SelectSingle(r => r.Id == order.Restaurant.Id)!;
                    string[] parts = restaurant.DeliveryTime.Split('-');

                    order.DeliveryTime = Random.Shared.Next(int.Parse(parts[0]), int.Parse(parts[1]));
                    order.Status = OrderStatus.InProgress;
                    orderRepository.Update(order);

                    logger.Info($"Order #{order.Id} is accepted. Delivery time: {order.DeliveryTime}");
                    continue;
                }

                if (order.Status == OrderStatus.InProgress && order.PlaceDate.AddMinutes(order.DeliveryTime) <= DateTime.Now)
                {
                    order.Status = OrderStatus.Done;
                    orderRepository.Update(order);

                    logger.Info($"Order #{order.Id} is done.");
                }
            }
        }
    }

    public async Task StopAsync()
    {
        if (!IsRunning)
        {
            return;
        }

        cts.Cancel();
        IsRunning = false;
        await Task.CompletedTask;
    }
}
