using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using Moq;
using Viralt.DTO.Settings;
using Viralt.Infra.AppServices;

namespace Viralt.Tests.Infra.AppServices;

public class ImageAppServiceTests
{
    private const string Region = "sa-east-1";

    private readonly Mock<IAmazonS3> _s3Mock;
    private readonly List<PutObjectRequest> _putRequests;
    private readonly S3Setting _setting;

    public ImageAppServiceTests()
    {
        _putRequests = new List<PutObjectRequest>();
        _s3Mock = new Mock<IAmazonS3>();
        _s3Mock
            .Setup(s => s.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()))
            .Callback<PutObjectRequest, CancellationToken>((req, _) => _putRequests.Add(req))
            .ReturnsAsync(new PutObjectResponse { HttpStatusCode = System.Net.HttpStatusCode.OK });

        _setting = new S3Setting
        {
            BucketName = "emagine",
            Prefix = "viralt/",
            Region = Region,
            ServiceUrl = string.Empty,
            PublicBaseUrl = string.Empty,
            AccessKey = string.Empty,
            SecretKey = string.Empty
        };
    }

    private ImageAppService CreateSut() => new ImageAppService(_s3Mock.Object, Options.Create(_setting));

    private static Stream CreateStream() => new MemoryStream(new byte[] { 0x89, 0x50, 0x4E, 0x47 });

    private PutObjectRequest UploadAndCapture(string fileName, out string returned)
    {
        var sut = CreateSut();
        returned = sut.UploadFile(CreateStream(), fileName);
        return Assert.Single(_putRequests);
    }

    [Fact]
    public void UploadFile_ShouldUseEmagineBucket_WhenUploading()
    {
        // Act
        var request = UploadAndCapture("foto.PNG", out _);

        // Assert
        Assert.Equal("emagine", request.BucketName);
    }

    [Fact]
    public void UploadFile_ShouldPrefixKeyWithViraltAndLowercaseExtension_WhenUploading()
    {
        // Act
        var request = UploadAndCapture("foto.PNG", out _);

        // Assert
        Assert.StartsWith("viralt/", request.Key);
        Assert.EndsWith(".png", request.Key);
    }

    [Fact]
    public void UploadFile_ShouldGenerateDifferentKeys_WhenUploadingSameFileNameTwice()
    {
        // Arrange
        var sut = CreateSut();

        // Act
        sut.UploadFile(CreateStream(), "foto.PNG");
        sut.UploadFile(CreateStream(), "foto.PNG");

        // Assert
        Assert.Equal(2, _putRequests.Count);
        Assert.NotEqual(_putRequests[0].Key, _putRequests[1].Key);
    }

    [Fact]
    public void UploadFile_ShouldInferContentType_WhenExtensionIsPng()
    {
        // Act
        var request = UploadAndCapture("foto.PNG", out _);

        // Assert
        Assert.Equal("image/png", request.ContentType);
    }

    [Fact]
    public void UploadFile_ShouldNotSetCannedAcl_WhenUploading()
    {
        // Act
        var request = UploadAndCapture("foto.PNG", out _);

        // Assert
        Assert.Null(request.CannedACL);
    }

    [Fact]
    public void UploadFile_ShouldReturnNameWithoutPrefix_WhenUploadSucceeds()
    {
        // Act
        var request = UploadAndCapture("foto.PNG", out var returned);

        // Assert
        Assert.False(string.IsNullOrEmpty(returned));
        Assert.DoesNotContain("/", returned);
        Assert.Equal("viralt/" + returned, request.Key);
    }

    [Fact]
    public void UploadFile_ShouldNormalizePrefix_WhenPrefixStartsWithSlashAndLacksTrailingSlash()
    {
        // Arrange
        _setting.Prefix = "/viralt";

        // Act
        var request = UploadAndCapture("foto.PNG", out var returned);

        // Assert
        Assert.StartsWith("viralt/", request.Key);
        Assert.Equal("viralt/" + returned, request.Key);
    }

    [Fact]
    public void UploadFile_ShouldThrowInvalidOperationWithErrorCode_WhenS3ReturnsAccessDenied()
    {
        // Arrange
        _s3Mock
            .Setup(s => s.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new AmazonS3Exception("Access Denied") { ErrorCode = "AccessDenied" });
        var sut = CreateSut();

        // Act
        var ex = Assert.Throws<InvalidOperationException>(() => sut.UploadFile(CreateStream(), "foto.png"));

        // Assert
        Assert.Contains("S3: AccessDenied", ex.Message);
    }

    [Fact]
    public void UploadFile_ShouldThrowMentioningRegion_WhenServiceUrlAndRegionAreEmpty()
    {
        // Arrange
        _setting.ServiceUrl = string.Empty;
        _setting.Region = string.Empty;
        var sut = CreateSut();

        // Act
        var ex = Assert.Throws<InvalidOperationException>(() => sut.UploadFile(CreateStream(), "foto.png"));

        // Assert
        Assert.Contains("S3__Region", ex.Message);
        _s3Mock.Verify(
            s => s.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void GetImageUrl_ShouldReturnEmpty_WhenFileNameIsEmpty(string fileName)
    {
        // Arrange
        var sut = CreateSut();

        // Act
        var url = sut.GetImageUrl(fileName);

        // Assert
        Assert.Equal(string.Empty, url);
    }

    [Fact]
    public void GetImageUrl_ShouldBuildAwsUrlFromSettingRegion_WhenPublicBaseUrlIsEmpty()
    {
        // Arrange
        var sut = CreateSut();

        // Act
        var url = sut.GetImageUrl("a.png");

        // Assert
        Assert.Equal($"https://emagine.s3.{Region}.amazonaws.com/viralt/a.png", url);
    }

    [Fact]
    public void GetImageUrl_ShouldUsePublicBaseUrl_WhenConfigured()
    {
        // Arrange
        _setting.PublicBaseUrl = "https://cdn.x.com/";
        var sut = CreateSut();

        // Act
        var url = sut.GetImageUrl("a.png");

        // Assert
        Assert.Equal("https://cdn.x.com/viralt/a.png", url);
    }

    [Fact]
    public void GetImageUrl_ShouldUseNormalizedPrefix_WhenPrefixStartsWithSlash()
    {
        // Arrange
        _setting.Prefix = "/viralt";
        var sut = CreateSut();

        // Act
        var url = sut.GetImageUrl("a.png");

        // Assert
        Assert.Equal($"https://emagine.s3.{Region}.amazonaws.com/viralt/a.png", url);
    }

    [Theory]
    [InlineData("../x.png")]
    [InlineData("sub/x.png")]
    [InlineData("sub\\x.png")]
    public void GetImageUrl_ShouldThrowArgumentException_WhenNameEscapesPrefix(string fileName)
    {
        // Arrange
        var sut = CreateSut();

        // Act & Assert
        Assert.Throws<ArgumentException>(() => sut.GetImageUrl(fileName));
    }

    [S3IntegrationFact]
    [Trait("Category", "S3Integration")]
    public async Task UploadFile_ShouldBePubliclyReadable_WhenUsingRealBucket()
    {
        // Arrange
        var setting = new S3Setting
        {
            BucketName = Env("S3__BucketName") ?? "emagine",
            Prefix = Env("S3__Prefix") ?? "viralt/",
            Region = Env("S3__Region") ?? string.Empty,
            ServiceUrl = Env("S3__ServiceUrl") ?? string.Empty,
            PublicBaseUrl = Env("S3__PublicBaseUrl") ?? string.Empty,
            AccessKey = Env("S3__AccessKey") ?? string.Empty,
            SecretKey = Env("S3__SecretKey") ?? string.Empty
        };

        var credentials = new BasicAWSCredentials(setting.AccessKey, setting.SecretKey);
        using IAmazonS3 client = string.IsNullOrWhiteSpace(setting.ServiceUrl)
            ? new AmazonS3Client(credentials, RegionEndpoint.GetBySystemName(setting.Region))
            : new AmazonS3Client(credentials, new AmazonS3Config { ServiceURL = setting.ServiceUrl, ForcePathStyle = true });

        var sut = new ImageAppService(client, Options.Create(setting));
        var content = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };

        // Act
        var name = sut.UploadFile(new MemoryStream(content), "integration-test.png");
        var url = sut.GetImageUrl(name);

        try
        {
            using var http = new HttpClient();
            using var response = await http.GetAsync(url);

            // Assert
            Assert.True(response.IsSuccessStatusCode, $"GET {url} returned {(int)response.StatusCode}");
            Assert.Equal(content, await response.Content.ReadAsByteArrayAsync());
        }
        finally
        {
            var prefix = setting.Prefix.Trim('/') + "/";
            await client.DeleteObjectAsync(setting.BucketName, prefix + name);
        }
    }

    private static string Env(string name)
    {
        var value = Environment.GetEnvironmentVariable(name);
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }

    public sealed class S3IntegrationFactAttribute : FactAttribute
    {
        public S3IntegrationFactAttribute()
        {
            if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("S3__AccessKey")))
                Skip = "S3__AccessKey not set; skipping S3 integration test.";
        }
    }
}
