namespace nomnom.Services;

internal class HttpRequestsSender : IDisposable
{
    private readonly HttpClient http = new HttpClient
    {
        DefaultRequestHeaders =
        {
            { "User-Agent", "nomnom/1.0 (admin@example.com)" }
        }
    };

    internal async Task<string?> GetAsync(string url)
    {
        HttpResponseMessage response = await http.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        string content = await response.Content.ReadAsStringAsync();
        return content;
    }

    public void Dispose()
    {
        http.CancelPendingRequests();
        http.Dispose();
    }
}
