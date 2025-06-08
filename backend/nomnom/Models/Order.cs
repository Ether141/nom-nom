using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Table("order")]
internal class Order
{
    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Relation("id")]
    [Column("user_id")]
    public User User { get; set; }

    [Relation("id")]
    [Column("restaurant_id")]
    public Restaurant Restaurant { get; set; }

    [Column("place_date")]
    public DateTime PlaceDate { get; set; }

    [Column("delivery_time")]
    public int DeliveryTime { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("status")]
    public OrderStatus Status { get; set; }

    [Column("total_price")]
    public decimal TotalPrice { get; set; }

    [Relation("order_id")]
    [Column("id")]
    public List<OrderProduct> Products { get; set; }
}
