namespace nomnom.Mapping;

internal interface ICollectionMapper<TFrom, TTo>
{
    IEnumerable<TTo> MapCollection(IEnumerable<TFrom> from);
    IEnumerable<TFrom> ReverseMapCollection(IEnumerable<TTo> from);
}
