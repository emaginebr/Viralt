using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class WebhookRepository : IWebhookRepository<Webhook>
{
    private readonly ViraltContext _context;

    public WebhookRepository(ViraltContext context)
    {
        _context = context;
    }

    public Webhook GetById(long webhookId)
    {
        return _context.Webhooks.Find(webhookId);
    }

    public IEnumerable<Webhook> ListByUser(long userId)
    {
        return _context.Webhooks.Where(x => x.UserId == userId).ToList();
    }

    public Webhook Insert(Webhook model)
    {
        _context.Webhooks.Add(model);
        _context.SaveChanges();
        return model;
    }

    public Webhook Update(Webhook model)
    {
        var existing = _context.Webhooks.Find(model.WebhookId);
        if (existing == null)
            throw new KeyNotFoundException($"Webhook {model.WebhookId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long webhookId)
    {
        var entity = _context.Webhooks.Find(webhookId)
            ?? throw new KeyNotFoundException($"Webhook {webhookId} not found.");
        _context.Webhooks.Remove(entity);
        _context.SaveChanges();
    }
}
