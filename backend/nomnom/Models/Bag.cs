using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Table("bag")]
internal class Bag
{
    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Relation("id")]
    [Column("user_id")]
    public User User { get; set; }

    [Column("restaurant_id")]
    public int RestaurantId { get; set; }

    [Relation("bag_id")]
    [Column("id")]
    public List<BagProduct> Products { get; set; }
}
