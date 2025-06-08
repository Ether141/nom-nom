using nomnom.DataTransferObjects;
using nomnom.Models;

namespace nomnom.Mapping;

internal class AddressMapper : IMapper<Address, AddressDTO>, ICollectionMapper<Address, AddressDTO>
{
    public AddressDTO Map(Address from) => new AddressDTO
    {
        Id = from.Id,
        Name = from.Name,
        Street = from.Street,
        PostalCode = from.PostalCode,
        City = from.City,
        PhoneNumber = from.PhoneNumber
    };

    public IEnumerable<AddressDTO> MapCollection(IEnumerable<Address> from) => from.Select(Map);

    public Address ReverseMap(AddressDTO from) => throw new NotImplementedException();

    public IEnumerable<Address> ReverseMapCollection(IEnumerable<AddressDTO> from) => throw new NotImplementedException();
}
