using BlinkDatabase.Annotations;
using BlinkHttp.Authentication;

namespace nomnom.Models;

[Table("user")]
internal class User : IUser
{
    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("email")]
    public string Email { get; set; }

    [Column("password")]
    public string Password { get; set; }

    [Column("offers_acceptance")]
    public bool OffersAcceptance { get; set; }

    [Column("balance")]
    public decimal Balance { get; set; }

    [Column("role_id")]
    [Relation("id")]
    public UserRole Role { get; set; }

    string IUser.Id => Id.ToString();

    string IUser.Username => Id.ToString();

    string[] IUser.Roles => [Role.Role ?? ""];
}
