using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Table("restaurant_address")]
public class RestaurantAddress
{
    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Column("address")]
    public string Address { get; set; }

    [Column("latitude")]
    public decimal Latitude { get; set; }

    [Column("longitude")]
    public decimal Longitude { get; set; }
}
