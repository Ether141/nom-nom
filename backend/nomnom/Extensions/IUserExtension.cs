using BlinkHttp.Authentication;
using nomnom.Models;

namespace nomnom.Extensions;

internal static class IUserExtension
{
    internal static int GetId(this IUser user) => ((User)user).Id;
}
