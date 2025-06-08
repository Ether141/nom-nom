namespace nomnom.DataTransferObjects;

internal class PlaceOrderDTO
{
    public int RestaurantId { get; set; }
    public int[] Products { get; set; }
    public string Comment { get; set; }
}
