using BlinkDatabase.General;
using BlinkHttp.Authentication;
using nomnom.Models;

namespace nomnom.Services;

internal class UserInfoProvider : IUserInfoProvider
{
    private readonly IRepository<User> repository;

    public UserInfoProvider(IRepository<User> repository)
    {
        this.repository = repository;
    }

    public string? GetHashedPassword(string userId) => repository.SelectSingle(u => u.Id.ToString() == userId)?.Password;

    public IUser? GetUser(string id) => repository.SelectSingle(u => u.Id.ToString() == id);

    public IUser? GetUserByUsername(string username) => repository.SelectSingle(u => u.Email == username);
}