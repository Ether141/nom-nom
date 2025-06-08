using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Table("restaurant")]
public class Restaurant
{
    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("opinion")]
    public decimal Opinion { get; set; }

    [Column("opinion_number")]
    public int OpinionNumber { get; set; }

    [Column("tags")]
    public string Tags { get; set; }

    [Column("banner_path")]
    public string BannerPath { get; set; }

    [Column("delivery_price")]
    public decimal DeliveryPrice { get; set; }

    [Column("min_price_to_delivery")]
    public decimal MinimalPriceForDelivery { get; set; }

    [Column("delivery_time")]
    public string DeliveryTime { get; set; }

    [Relation("id")]
    [Column("address_id")]
    public RestaurantAddress Address { get; set; }

    [Relation("restaurant_id")]
    [Column("id")]
    public List<Product>? Products { get; set; }
}
