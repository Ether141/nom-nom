using nomnom.Models;
using System.Text.Json.Serialization;

namespace nomnom.DataTransferObjects;

internal class OrderDTO
{
    public int Id { get; set; }
    public int RestaurantId { get; set; }
    public DateTime PlaceDate { get; set; }
    public string? Comment { get; set; }
    public int DeliveryTime { get; set; }
    public decimal TotalPrice { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public OrderStatus Status { get; set; }

    public int[] Products { get; set; }
}
