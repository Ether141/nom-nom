using BlinkHttp.Validation;
using System.Text.RegularExpressions;

namespace nomnom.Validation;

internal class PasswordAttribute : ValidationAttribute
{
    private static readonly Regex passwordRegex = new Regex("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$");

    public PasswordAttribute() : base("Password does not meet complexity requirements.") { }

    public override string? ValidateAndGetErrorMessage(object? value) => value is string password && passwordRegex.IsMatch(password) ? null : ErrorMessage;
}
