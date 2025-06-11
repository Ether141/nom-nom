namespace nomnom.DataTransferObjects;

internal class RestaurantDetailsDTO
{
    public RestaurantDTO Restaurant { get; set; }
    public IEnumerable<ProductDTO> Products { get; set; }
}
