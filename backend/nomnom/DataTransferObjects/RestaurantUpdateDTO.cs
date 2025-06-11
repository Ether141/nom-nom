namespace nomnom.DataTransferObjects;

internal class RestaurantUpdateDTO
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Tags { get; set; }
    public string Address { get; set; }
    public decimal DeliveryPrice { get; set; }
    public decimal MinimalPriceForDelivery { get; set; }
    public string DeliveryTime { get; set; }
    public ProductUpdateDTO[] ProductUpdates { get; set; }
}

internal class ProductUpdateDTO
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; }
}