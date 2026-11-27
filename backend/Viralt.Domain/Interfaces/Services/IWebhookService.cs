using Viralt.DTO.Campaign;

namespace Viralt.Domain.Interfaces.Services;

public interface IWebhookService
{
    IEnumerable<WebhookInfo> GetByUser(long userId);
    WebhookInfo Insert(WebhookInsertInfo dto);
    WebhookInfo Update(WebhookUpdateInfo dto);
    void Delete(long webhookId);
    Task DispatchEvent(long userId, string eventName, string payload);
}
