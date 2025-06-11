namespace nomnom.Location;

internal interface ILocationService : IDisposable
{
    Task<(double latitude, double longitude)?> GetCoordinates(string address);
}
