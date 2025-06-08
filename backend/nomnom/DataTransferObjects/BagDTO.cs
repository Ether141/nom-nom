namespace nomnom.DataTransferObjects;

internal class BagDTO
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RestaurantId { get; set; }
    public List<ProductDTO> Products { get; set; }
}
