﻿namespace nomnom.DataTransferObjects;

internal class ProductDTO
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; }
    public int RestaurantId { get; set; }
    public string Category { get; set; }
}
