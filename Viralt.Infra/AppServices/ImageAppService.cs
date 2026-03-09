using Amazon.S3;
using Amazon.S3.Transfer;
using Viralt.Infra.Interfaces.AppServices;

namespace Viralt.Infra.AppServices;

public class ImageAppService : IImageAppService
{
    private const string ACCESS_KEY = "DO00JY46P2RAD368YY3B";
    private const string SECRET_KEY = "6aojG9/UVwcn9Ss8mT7HNCPPUCk2GF1bG/CarPcC5n0";
    private const string BUCKET_NAME = "monexup";
    private const string ENDPOINT = "https://emagine.nyc3.digitaloceanspaces.com";

    public string GetImageUrl(string fileName)
    {
        if (!string.IsNullOrEmpty(fileName))
            return ENDPOINT + "/" + BUCKET_NAME + "/" + fileName;
        return string.Empty;
    }

    public string UploadFile(Stream stream, string fileName)
    {
        var config = new AmazonS3Config
        {
            ServiceURL = ENDPOINT,
            ForcePathStyle = true,
        };

        using var client = new AmazonS3Client(ACCESS_KEY, SECRET_KEY, config);
        var transferUtility = new TransferUtility(client);

        var request = new TransferUtilityUploadRequest
        {
            InputStream = stream,
            Key = fileName,
            BucketName = BUCKET_NAME,
            CannedACL = S3CannedACL.PublicRead
        };

        transferUtility.Upload(request);
        return fileName;
    }
}
