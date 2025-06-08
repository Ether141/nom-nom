namespace nomnom.Content;

public interface IFilesProvider
{
    byte[]? LoadFile(string path);
}
