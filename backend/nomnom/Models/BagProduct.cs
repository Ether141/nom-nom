using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Table("bag_product")]
internal class BagProduct
{
    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Relation("id")]
    [Column("bag_id")]
    public Bag Bag { get; set; }

    [Relation("id")]
    [Column("product_id")]
    public Product Product { get; set; }
}
