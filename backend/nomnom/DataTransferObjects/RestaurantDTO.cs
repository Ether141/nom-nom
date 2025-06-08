namespace nomnom.DataTransferObjects;

internal class RestaurantDTO
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Opinion { get; set; }
    public int OpinionNumber { get; set; }
    public string Tags { get; set; }
    public string BannerPath { get; set; }
    public decimal DeliveryPrice { get; set; }
    public decimal MinimalPriceForDelivery { get; set; }
    public string DeliveryTime { get; set; }
    public string Address { get; set; }
}
