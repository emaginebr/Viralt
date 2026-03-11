using Microsoft.AspNetCore.Http;
using Viralt.Infra.Interfaces.AppServices;
using zTools.ACL.Interfaces;

namespace Viralt.Infra.AppServices;

public class ImageAppService : IImageAppService
{
    private const string BUCKET_NAME = "monexup";
    private readonly IFileClient _fileClient;

    public ImageAppService(IFileClient fileClient)
    {
        _fileClient = fileClient;
    }

    public string GetImageUrl(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return string.Empty;
        return _fileClient.GetFileUrlAsync(BUCKET_NAME, fileName).GetAwaiter().GetResult();
    }

    public string UploadFile(Stream stream, string fileName)
    {
        using var ms = new MemoryStream();
        stream.CopyTo(ms);
        ms.Position = 0;

        IFormFile formFile = new FormFileWrapper(ms, fileName, "application/octet-stream");
        return _fileClient.UploadFileAsync(BUCKET_NAME, formFile).GetAwaiter().GetResult();
    }
}

internal class FormFileWrapper : IFormFile
{
    private readonly Stream _stream;
    private readonly string _fileName;
    private readonly string _contentType;

    public FormFileWrapper(Stream stream, string fileName, string contentType)
    {
        _stream = stream;
        _fileName = fileName;
        _contentType = contentType;
    }

    public string ContentType => _contentType;
    public string ContentDisposition => $"form-data; name=\"file\"; filename=\"{_fileName}\"";
    public IHeaderDictionary Headers => new HeaderDictionary();
    public long Length => _stream.Length;
    public string Name => "file";
    public string FileName => _fileName;

    public void CopyTo(Stream target) => _stream.CopyTo(target);
    public Task CopyToAsync(Stream target, CancellationToken ct = default) => _stream.CopyToAsync(target, ct);
    public Stream OpenReadStream() => _stream;
}
