using System.Security.Cryptography;
using System.Text;
using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Campaign;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class WebhookService : IWebhookService
{
    private readonly IWebhookRepository<Webhook> _repository;
    private readonly IHttpClientFactory _httpClientFactory;

    public WebhookService(IWebhookRepository<Webhook> repository, IHttpClientFactory httpClientFactory)
    {
        _repository = repository;
        _httpClientFactory = httpClientFactory;
    }

    public IEnumerable<WebhookInfo> GetByUser(long userId)
    {
        return _repository.ListByUser(userId).Select(MapToDto);
    }

    public WebhookInfo Insert(WebhookInsertInfo dto)
    {
        var model = MapToModel(dto);
        model.CreatedAt = DateTime.UtcNow;
        var saved = _repository.Insert(model);
        return MapToDto(saved);
    }

    public WebhookInfo Update(WebhookUpdateInfo dto)
    {
        var model = MapToModel(dto);
        model.WebhookId = dto.WebhookId;
        var updated = _repository.Update(model);
        return MapToDto(updated);
    }

    public void Delete(long webhookId)
    {
        _repository.Delete(webhookId);
    }

    public async Task DispatchEvent(long userId, string eventName, string payload)
    {
        var webhooks = _repository.ListByUser(userId)
            .Where(w => w.IsActive && w.Events != null && w.Events.Contains(eventName));

        var client = _httpClientFactory.CreateClient();

        foreach (var webhook in webhooks)
        {
            try
            {
                var signature = ComputeHmacSha256(payload, webhook.Secret);
                var request = new HttpRequestMessage(HttpMethod.Post, webhook.Url);
                request.Content = new StringContent(payload, Encoding.UTF8, "application/json");
                request.Headers.Add("X-Viralt-Signature", signature);
                request.Headers.Add("X-Viralt-Event", eventName);

                _ = await client.SendAsync(request);
            }
            catch
            {
                // Fire-and-forget: silently ignore failures for now
            }
        }
    }

    private static string ComputeHmacSha256(string payload, string secret)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secret ?? string.Empty);
        var payloadBytes = Encoding.UTF8.GetBytes(payload ?? string.Empty);
        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(payloadBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static WebhookInfo MapToDto(Webhook model)
    {
        if (model == null) return null;
        return new WebhookInfo
        {
            WebhookId = model.WebhookId,
            UserId = model.UserId,
            Url = model.Url,
            Secret = model.Secret,
            Events = model.Events,
            IsActive = model.IsActive,
            CreatedAt = model.CreatedAt
        };
    }

    private static Webhook MapToModel(WebhookInsertInfo dto) => new()
    {
        UserId = dto.UserId,
        Url = dto.Url,
        Secret = dto.Secret,
        Events = dto.Events,
        IsActive = dto.IsActive
    };
}
