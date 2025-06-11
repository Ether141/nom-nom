using BlinkHttp.Configuration;

namespace nomnom.Content;

public class FilesProvider : IFilesProvider
{
    private readonly IConfiguration configuration;

    public string MainPath => configuration["server:content_path"]!;

    public FilesProvider(IConfiguration configuration)
    {
        this.configuration = configuration;
    }

    public byte[]? LoadFile(string path)
    {
        path = Path.Combine(MainPath, path);

        if (!File.Exists(path))
        {
            return null;
        }

        return File.ReadAllBytes(path);
    }

    public bool FileExists(string path) => File.Exists(Path.Combine(MainPath, path));

    public void SaveFile(string path, byte[] data)
    {
        var fullPath = Path.Combine(MainPath, path);
        var directory = Path.GetDirectoryName(fullPath);

        if (directory is not null && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        File.WriteAllBytes(fullPath, data);
    }
}
