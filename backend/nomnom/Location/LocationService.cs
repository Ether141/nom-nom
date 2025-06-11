using nomnom.Services;
using System.Globalization;
using System.Text.Json;

namespace nomnom.Location;

internal class LocationService : ILocationService
{
    private readonly HttpRequestsSender httpRequestsSender = new HttpRequestsSender();
    private static long LastCallTimestamp = 0;

    public async Task<IEnumerable<string>> GetSuggestions(string address)
    {
        await WaitForNextCall();

        string? result = await httpRequestsSender.GetAsync($"https://nominatim.openstreetmap.org/search?q={address}&format=jsonv2&limit=5&addressdetails=0");

        if (result == null)
        {
            return [];
        }

        try
        {
            using JsonDocument doc = JsonDocument.Parse(result);
            return [.. doc.RootElement.EnumerateArray().Select(e => e.GetProperty("display_name").GetString() ?? string.Empty)];
        }
        catch
        {
            return [];
        }
    }

    public async Task<(double latitude, double longitude)?> GetCoordinates(string address)
    {
        await WaitForNextCall();

        string? result = await httpRequestsSender.GetAsync($"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=jsonv2&limit=1");

        if (result == null)
        {
            return null;
        }

        NominatimResult[]? results = JsonSerializer.Deserialize<NominatimResult[]>(result!);

        if (results?.Length > 0)
        {
            return (double.Parse(results[0].lat, CultureInfo.InvariantCulture), double.Parse(results[0].lon, CultureInfo.InvariantCulture));
        }

        return null;
    }

    public void Dispose() => httpRequestsSender.Dispose();

    // need to wait at least one second, because public geo api accepts only one request per second
    private static async Task WaitForNextCall()
    {
        long currentTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        if (LastCallTimestamp == 0)
        {
            LastCallTimestamp = currentTimestamp;
            return;
        }

        if (currentTimestamp - LastCallTimestamp < 1000)
        {
            long delay = 1000 - (currentTimestamp - LastCallTimestamp) + 100;
            await Task.Delay((int)delay);
        }

        LastCallTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    private record NominatimResult
    {
        public string lat { get; init; } = default!;
        public string lon { get; init; } = default!;
        public string display_name { get; init; } = default!;
    }
}
