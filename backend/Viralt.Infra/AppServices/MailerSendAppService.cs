using System.Net;
using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Viralt.DTO.MailerSend;
using Viralt.DTO.Settings;
using Viralt.Infra.Interfaces.AppServices;

namespace Viralt.Infra.AppServices;

/// <summary>
/// Sends transactional e-mail directly through the MailerSend REST API v1 (research R1).
/// Never returns <c>false</c> silently: every failure is an <see cref="InvalidOperationException"/>.
/// </summary>
public class MailerSendAppService : IMailerSendAppService
{
    public const string HttpClientName = "MailerSend";

    private static readonly JsonSerializerSettings SerializerSettings = new()
    {
        NullValueHandling = NullValueHandling.Ignore
    };

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly MailerSendSetting _setting;

    public MailerSendAppService(IHttpClientFactory httpClientFactory, IOptions<MailerSendSetting> options)
    {
        _httpClientFactory = httpClientFactory;
        _setting = options.Value;
    }

    public async Task<bool> SendMail(MailerInfo email)
    {
        if (email == null)
            throw new ArgumentNullException(nameof(email));

        if (string.IsNullOrWhiteSpace(_setting.ApiToken))
            throw new InvalidOperationException("MailerSend__ApiToken não configurado");

        email.From ??= new MailerRecipientInfo
        {
            Email = _setting.FromEmail,
            Name = _setting.FromName
        };

        var client = _httpClientFactory.CreateClient(HttpClientName);
        var json = JsonConvert.SerializeObject(email, SerializerSettings);

        using var request = new HttpRequestMessage(HttpMethod.Post, "email")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _setting.ApiToken.Trim());
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        HttpResponseMessage response;
        try
        {
            response = await client.SendAsync(request);
        }
        catch (TaskCanceledException ex)
        {
            throw new InvalidOperationException($"MailerSend indisponível: {ex.Message}", ex);
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException($"MailerSend indisponível: {ex.Message}", ex);
        }

        using (response)
        {
            if (response.IsSuccessStatusCode)
                return true;

            var status = (int)response.StatusCode;

            if (response.StatusCode == HttpStatusCode.Unauthorized || response.StatusCode == HttpStatusCode.Forbidden)
                throw new InvalidOperationException(
                    "MailerSend: token inválido ou sem permissão (MailerSend__ApiToken)");

            if (status == 422)
            {
                var body = await response.Content.ReadAsStringAsync();
                var message = BuildValidationMessage(body);
                if (message != null)
                    throw new InvalidOperationException($"MailerSend: {message}");
            }

            throw new InvalidOperationException($"MailerSend: HTTP {status}");
        }
    }

    private static string BuildValidationMessage(string body)
    {
        if (string.IsNullOrWhiteSpace(body))
            return null;

        MailerErrorInfo error;
        try
        {
            error = JsonConvert.DeserializeObject<MailerErrorInfo>(body);
        }
        catch (JsonException)
        {
            return null;
        }

        if (error == null || string.IsNullOrWhiteSpace(error.Message))
            return null;

        var details = error.Errors?
            .SelectMany(kv => (kv.Value ?? new List<string>()).Select(v => $"{kv.Key}: {v}"))
            .ToList();

        return details == null || details.Count == 0
            ? error.Message
            : $"{error.Message} ({string.Join("; ", details)})";
    }
}
