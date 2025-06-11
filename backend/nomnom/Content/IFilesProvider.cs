namespace nomnom.Content;

public interface IFilesProvider
{
    byte[]? LoadFile(string path);
    bool FileExists(string path);
    void SaveFile(string path, byte[] data);
}
