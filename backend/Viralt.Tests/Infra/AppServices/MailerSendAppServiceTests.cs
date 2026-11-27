using System.Net;
using System.Text;
using Microsoft.Extensions.Options;
using Moq;
using Newtonsoft.Json.Linq;
using Viralt.DTO.MailerSend;
using Viralt.DTO.Settings;
using Viralt.Infra.AppServices;

namespace Viralt.Tests.Infra.AppServices;

public class MailerSendAppServiceTests
{
    private const string ClientName = "MailerSend";
    private const string ApiUrl = "https://api.mailersend.com/v1/";

    private readonly FakeHttpMessageHandler _handler;
    private readonly Mock<IHttpClientFactory> _httpClientFactoryMock;
    private readonly MailerSendSetting _setting;

    public MailerSendAppServiceTests()
    {
        _handler = new FakeHttpMessageHandler();
        _httpClientFactoryMock = new Mock<IHttpClientFactory>();
        _httpClientFactoryMock
            .Setup(f => f.CreateClient(ClientName))
            .Returns(() => new HttpClient(_handler, disposeHandler: false) { BaseAddress = new Uri(ApiUrl) });

        _setting = new MailerSendSetting
        {
            ApiToken = "test-token",
            FromEmail = "sender@viralt.test",
            FromName = "Viralt Test",
            ApiUrl = ApiUrl
        };
    }

    private MailerSendAppService CreateSut() =>
        new MailerSendAppService(_httpClientFactoryMock.Object, Options.Create(_setting));

    private static MailerInfo CreateMail(MailerRecipientInfo from = null) => new MailerInfo
    {
        From = from,
        To = new List<MailerRecipientInfo>
        {
            new MailerRecipientInfo { Email = "winner@example.com", Name = "Winner" }
        },
        Subject = "Congratulations!",
        Html = "<p>Hi</p>"
    };

    [Fact]
    public async Task SendMail_ShouldReturnTrue_WhenProviderReturns202()
    {
        // Arrange
        _handler.Respond(HttpStatusCode.Accepted);
        var sut = CreateSut();

        // Act
        var result = await sut.SendMail(CreateMail(new MailerRecipientInfo { Email = "a@b.com", Name = "A" }));

        // Assert
        Assert.True(result);
        Assert.Equal(1, _handler.CallCount);
        Assert.Equal(HttpMethod.Post, _handler.LastRequest.Method);
        Assert.Equal(new Uri(ApiUrl + "email"), _handler.LastRequest.RequestUri);
        Assert.Equal("Bearer", _handler.LastRequest.Headers.Authorization?.Scheme);
        Assert.Equal("test-token", _handler.LastRequest.Headers.Authorization?.Parameter);
        _httpClientFactoryMock.Verify(f => f.CreateClient(ClientName), Times.AtLeastOnce);
    }

    [Fact]
    public async Task SendMail_ShouldFillFromWithConfiguredSender_WhenFromIsNull()
    {
        // Arrange
        _handler.Respond(HttpStatusCode.Accepted);
        var sut = CreateSut();

        // Act
        await sut.SendMail(CreateMail(from: null));

        // Assert
        Assert.NotNull(_handler.LastRequestBody);
        var body = JObject.Parse(_handler.LastRequestBody);
        Assert.Equal("sender@viralt.test", (string)body["from"]?["email"]);
        Assert.Equal("Viralt Test", (string)body["from"]?["name"]);
        Assert.Equal("winner@example.com", (string)body["to"]?[0]?["email"]);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public async Task SendMail_ShouldThrowWithoutCallingHandler_WhenApiTokenIsEmpty(string token)
    {
        // Arrange
        _setting.ApiToken = token;
        _handler.Respond(HttpStatusCode.Accepted);
        var sut = CreateSut();

        // Act
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sut.SendMail(CreateMail()));

        // Assert
        Assert.Contains("MailerSend__ApiToken", ex.Message);
        Assert.Equal(0, _handler.CallCount);
    }

    [Theory]
    [InlineData(HttpStatusCode.Unauthorized)]
    [InlineData(HttpStatusCode.Forbidden)]
    public async Task SendMail_ShouldThrowMentioningApiToken_WhenProviderRejectsToken(HttpStatusCode status)
    {
        // Arrange
        _handler.Respond(status, "{\"message\":\"Unauthenticated.\"}");
        var sut = CreateSut();

        // Act
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sut.SendMail(CreateMail()));

        // Assert
        Assert.Contains("MailerSend__ApiToken", ex.Message);
    }

    [Fact]
    public async Task SendMail_ShouldThrowWithProviderMessage_WhenProviderReturns422()
    {
        // Arrange
        const string body =
            "{\"message\":\"The from.email domain must be verified in your account.\"," +
            "\"errors\":{\"from.email\":[\"The from.email domain must be verified in your account.\"]}}";
        _handler.Respond((HttpStatusCode)422, body);
        var sut = CreateSut();

        // Act
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sut.SendMail(CreateMail()));

        // Assert
        Assert.Contains("MailerSend:", ex.Message);
        Assert.Contains("The from.email domain must be verified in your account.", ex.Message);
    }

    [Fact]
    public async Task SendMail_ShouldThrowUnavailable_WhenRequestTimesOut()
    {
        // Arrange
        _handler.Throw(new TaskCanceledException("The request was canceled due to the configured HttpClient.Timeout."));
        var sut = CreateSut();

        // Act
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sut.SendMail(CreateMail()));

        // Assert
        Assert.Contains("MailerSend indisponível", ex.Message);
    }

    private sealed class FakeHttpMessageHandler : HttpMessageHandler
    {
        private HttpStatusCode _status = HttpStatusCode.Accepted;
        private string _responseBody = string.Empty;
        private Exception _exception;

        public int CallCount { get; private set; }
        public HttpRequestMessage LastRequest { get; private set; }
        public string LastRequestBody { get; private set; }

        public void Respond(HttpStatusCode status, string body = "")
        {
            _status = status;
            _responseBody = body;
            _exception = null;
        }

        public void Throw(Exception exception) => _exception = exception;

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            CallCount++;
            LastRequest = request;
            LastRequestBody = request.Content == null
                ? null
                : await request.Content.ReadAsStringAsync(cancellationToken);

            if (_exception != null)
                throw _exception;

            return new HttpResponseMessage(_status)
            {
                Content = new StringContent(_responseBody, Encoding.UTF8, "application/json"),
                RequestMessage = request
            };
        }
    }
}
