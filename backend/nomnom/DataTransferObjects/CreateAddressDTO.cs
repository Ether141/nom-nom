using BlinkHttp.Validation;

namespace nomnom.DataTransferObjects;

internal class CreateAddressDTO
{
    [DisallowNull]
    public string Name { get; set; }

    [DisallowNull]
    public string Street { get; set; }

    [DisallowNull, TestRegex(@"^\d{2}-\d{3}$")]
    public string PostalCode { get; set; }

    [DisallowNull]
    public string City { get; set; }

    [DisallowNull, TestRegex(@"^\+?\d{9,12}$")]
    public string PhoneNumber { get; set; }
}
