using BlinkHttp.Validation;
using nomnom.Validation;

namespace nomnom.DataTransferObjects;

internal class CreateUserDTO
{
    [MinLength(2), MaxLength(32), DisallowNull]
    public string Name { get; set; }

    [DisallowNull, Email]
    public string Email { get; set; }

    [MinLength(8), MaxLength(1024), Password, DisallowNull]
    public string Password { get; set; }

    [MustBeTrue]
    public bool RulesAcceptance { get; set; }

    public bool OffersAcceptance { get; set; }
}
