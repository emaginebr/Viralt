using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;
using Viralt.DTO.Settings;
using Viralt.Infra.Interfaces.AppServices;

namespace Viralt.Infra.AppServices;

/// <summary>
/// Stores files directly in S3 (or an S3-compatible provider) under the configured prefix
/// (research R5, R6, R7). Objects are read publicly through the bucket policy; no ACL is set.
/// </summary>
public class ImageAppService : IImageAppService
{
    private const string DefaultContentType = "application/octet-stream";
    private static readonly FileExtensionContentTypeProvider ContentTypeProvider = new();

    private readonly IAmazonS3 _s3Client;
    private readonly S3Setting _setting;

    public ImageAppService(IAmazonS3 s3Client, IOptions<S3Setting> options)
    {
        _s3Client = s3Client;
        _setting = options.Value;
    }

    public string GetImageUrl(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return string.Empty;

        ValidateFileName(fileName);

        var baseUrl = string.IsNullOrWhiteSpace(_setting.PublicBaseUrl)
            ? BuildAwsBaseUrl()
            : _setting.PublicBaseUrl.Trim().TrimEnd('/');

        return $"{baseUrl}/{NormalizedPrefix()}{fileName}";
    }

    public string UploadFile(Stream stream, string fileName)
    {
        if (stream == null)
            throw new ArgumentNullException(nameof(stream));

        ValidateConfiguration();

        var extension = (Path.GetExtension(fileName ?? string.Empty) ?? string.Empty).ToLowerInvariant();
        var name = $"{Guid.NewGuid():N}{extension}";

        if (!ContentTypeProvider.TryGetContentType(name, out var contentType))
            contentType = DefaultContentType;

        var request = new PutObjectRequest
        {
            BucketName = _setting.BucketName.Trim(),
            Key = NormalizedPrefix() + name,
            InputStream = stream,
            ContentType = contentType,
            AutoCloseStream = false
        };

        try
        {
            _s3Client.PutObjectAsync(request).GetAwaiter().GetResult();
        }
        catch (AmazonS3Exception ex)
        {
            throw new InvalidOperationException($"S3: {ex.ErrorCode} — {ex.Message}", ex);
        }

        return name;
    }

    private string NormalizedPrefix()
    {
        var prefix = (_setting.Prefix ?? string.Empty).Trim().Trim('/');
        return string.IsNullOrEmpty(prefix) ? string.Empty : prefix + "/";
    }

    private string BuildAwsBaseUrl()
    {
        if (string.IsNullOrWhiteSpace(_setting.BucketName))
            throw new InvalidOperationException("S3__BucketName não configurado");
        if (string.IsNullOrWhiteSpace(_setting.Region))
            throw new InvalidOperationException("S3__Region não configurado (ou informe S3__PublicBaseUrl)");

        return $"https://{_setting.BucketName.Trim()}.s3.{_setting.Region.Trim()}.amazonaws.com";
    }

    private void ValidateConfiguration()
    {
        if (string.IsNullOrWhiteSpace(_setting.BucketName))
            throw new InvalidOperationException("S3__BucketName não configurado");

        if (string.IsNullOrWhiteSpace(_setting.ServiceUrl) && string.IsNullOrWhiteSpace(_setting.Region))
            throw new InvalidOperationException("S3__Region não configurado (obrigatório quando S3__ServiceUrl está vazio)");

        var hasAccessKey = !string.IsNullOrWhiteSpace(_setting.AccessKey);
        var hasSecretKey = !string.IsNullOrWhiteSpace(_setting.SecretKey);
        if (hasAccessKey && !hasSecretKey)
            throw new InvalidOperationException("S3__SecretKey não configurado (S3__AccessKey foi informada)");
        if (!hasAccessKey && hasSecretKey)
            throw new InvalidOperationException("S3__AccessKey não configurado (S3__SecretKey foi informada)");
    }

    private static void ValidateFileName(string fileName)
    {
        if (fileName.Contains('/') || fileName.Contains('\\') || fileName.Contains(".."))
            throw new ArgumentException("Nome de arquivo inválido: não pode conter '/', '\\' ou '..'.", nameof(fileName));
    }
}
