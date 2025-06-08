using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Table("address")]
internal class Address
{
    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("street")]
    public string Street { get; set; }

    [Column("postal_code")]
    public string PostalCode { get; set; }

    [Column("city")]
    public string City { get; set; }

    [Column("phone_number")]
    public string PhoneNumber { get; set; }

    [Relation]
    [Column("user_id")]
    public User User { get; set; }
}
