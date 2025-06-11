using BlinkDatabase.Annotations;

namespace nomnom.Models;

[Table("user_role")]
internal class UserRole
{
    public const string UserRoleName = "user";
    public const string AdminRoleName = "admin";

    [Id]
    [Column("id")]
    public int Id { get; set; }

    [Column("role")]
    public string? Role { get; set; }
}
