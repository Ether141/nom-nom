using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Table("product")]
public class Product
{
    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("price")]
    public decimal Price { get; set; }

    [Column("description")]
    public string Description { get; set; }

    [Column("category")]
    public string Category { get; set; }

    [Relation("id")]
    [Column("restaurant_id")]
    public Restaurant Restaurant { get; set; }
}
