using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Table("order_product")]
internal class OrderProduct
{
    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Relation("id")]
    [Column("order_id")]
    public Order Order { get; set; }

    [Column("product_id")]
    public int ProductId { get; set; }
}
