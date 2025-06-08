using BlinkHttp.Validation;

namespace nomnom.Validation;

internal class MustBeTrueAttribute : ValidationAttribute
{
    public MustBeTrueAttribute() : base("Given value must be true.") { }

    public override string? ValidateAndGetErrorMessage(object? value) => value is bool v && v ? null : ErrorMessage;
}
