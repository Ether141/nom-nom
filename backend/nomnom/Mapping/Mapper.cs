namespace nomnom.Mapping;

internal interface IMapper<TFrom, TTo>
{
    TTo Map(TFrom from);
    TFrom ReverseMap(TTo from);
}
