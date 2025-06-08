using BlinkDatabase.General;
using BlinkHttp.Http;
using BlinkHttp.Validation;
using nomnom.DataTransferObjects;
using nomnom.Extensions;
using nomnom.Mapping;
using nomnom.Models;

namespace nomnom.Controllers;

[Authorize]
[Route("address")]
internal class AddressController : Controller
{
    private readonly IRepository<Address> addressRepository;

    public AddressController(IRepository<Address> addressRepository)
    {
        this.addressRepository = addressRepository;
    }

    [HttpPost("get")]
    public IHttpResult Get()
    {
        IEnumerable<Address> addresses = addressRepository.Select(a => a.User.Id.ToString() == User!.Id);
        IEnumerable<AddressDTO> result = new AddressMapper().MapCollection(addresses);
        return JsonResult.FromObject(result);
    }

    [HttpPut]
    public IHttpResult Create([FromBody] CreateAddressDTO dto)
    {
        dto.PhoneNumber = dto.PhoneNumber.Replace(" ", "");

        if (!ValidateAddressDTO(dto))
        {
            return BadRequest();
        }

        int userId = User!.GetId();

        Address address = new Address()
        {
            Name = dto.Name,
            Street = dto.Street,
            PostalCode = dto.PostalCode,
            City = dto.City,
            PhoneNumber = FormatPhoneNumber(dto.PhoneNumber),
            User = new User() { Id = userId }
        };

        addressRepository.Insert(address);

        return JsonResult.FromObject(address, System.Net.HttpStatusCode.Created);
    }

    [HttpPost]
    public IHttpResult Edit([FromBody] int id, [FromBody] CreateAddressDTO dto)
    {
        dto.PhoneNumber = dto.PhoneNumber.Replace(" ", "");

        if (!ValidateAddressDTO(dto))
        {
            return BadRequest();
        }

        int userId = User!.GetId();
        Address? address = addressRepository.SelectSingle(a => a.Id == id && a.User.Id == userId);

        if (address == null)
        {
            return BadRequest();
        }

        address.Name = dto.Name;
        address.Street = dto.Street;
        address.PostalCode = dto.PostalCode;
        address.City = dto.City;
        address.PhoneNumber = FormatPhoneNumber(dto.PhoneNumber);

        addressRepository.Update(address);

        return Ok();
    }

    [HttpDelete("{id}")]
    public IHttpResult Delete([FromQuery] int id)
    {
        int userId = User!.GetId();
        bool exists = addressRepository.Exists(a => a.Id == id);

        if (!exists)
        {
            return BadRequest();
        }

        addressRepository.Delete(a => a.Id == id);
        return Ok();
    }

    private static bool ValidateAddressDTO(CreateAddressDTO dto)
    {
        ModelValidator validator = new ModelValidator();
        ValidationResult validationResult = validator.Validate(dto);
        return validationResult.IsValid;
    }

    private static string FormatPhoneNumber(string phoneNumber)
    {
        string cleanPhone = phoneNumber.Replace(" ", "");

        if (cleanPhone.StartsWith('+'))
        {
            string digits = cleanPhone[1..];
            return $"+{digits[..2]} {digits[2..5]} {digits[5..8]} {digits[8..11]}";
        }
        else
        {
            return $"{cleanPhone[..3]} {cleanPhone[3..6]} {cleanPhone[6..9]}";
        }
    }
}
