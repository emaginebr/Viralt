using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class CampaignRepository : ICampaignRepository<Campaign>
{
    private readonly ViraltContext _context;

    public CampaignRepository(ViraltContext context)
    {
        _context = context;
    }

    public Campaign GetById(long campaignId)
    {
        return _context.Campaigns.Find(campaignId);
    }

    public Campaign GetBySlug(string slug)
    {
        return _context.Campaigns.FirstOrDefault(x => x.Slug == slug);
    }

    public IEnumerable<Campaign> ListCampaigns(int take)
    {
        return _context.Campaigns.OrderBy(x => x.Title).Take(take).ToList();
    }

    public IEnumerable<Campaign> ListByUser(long userId)
    {
        return _context.Campaigns.Where(x => x.UserId == userId).ToList();
    }

    public Campaign Insert(Campaign model)
    {
        _context.Campaigns.Add(model);
        _context.SaveChanges();
        return model;
    }

    public Campaign Update(Campaign model)
    {
        var existing = _context.Campaigns.Find(model.CampaignId);
        if (existing == null)
            throw new KeyNotFoundException($"Campaign {model.CampaignId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long campaignId)
    {
        var entity = _context.Campaigns.Find(campaignId)
            ?? throw new KeyNotFoundException($"Campaign {campaignId} not found.");
        _context.Campaigns.Remove(entity);
        _context.SaveChanges();
    }
}
