using nomnom.DataTransferObjects;
using nomnom.Models;

namespace nomnom.Mapping;

internal class UserMapper : IMapper<CreateUserDTO, User>
{
    public User Map(CreateUserDTO from) => new User()
    {
        Name = from.Name,
        Email = from.Email,
        Password = from.Password
    };

    public CreateUserDTO ReverseMap(User from) => throw new NotImplementedException();
}
