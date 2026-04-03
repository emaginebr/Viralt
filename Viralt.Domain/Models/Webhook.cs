namespace Viralt.Domain.Models;

public class Webhook
{
    public long WebhookId { get; set; }
    public long UserId { get; set; }
    public string Url { get; set; }
    public string Secret { get; set; }
    public string Events { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
