using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class CampaignEntryRepository : ICampaignEntryRepository<CampaignEntry>
{
    private readonly ViraltContext _context;

    public CampaignEntryRepository(ViraltContext context)
    {
        _context = context;
    }

    public CampaignEntry GetById(long entryId)
    {
        return _context.CampaignEntries.Find(entryId);
    }

    public IEnumerable<CampaignEntry> ListEntries(long campaignId)
    {
        return _context.CampaignEntries.Where(x => x.CampaignId == campaignId).ToList();
    }

    public CampaignEntry Insert(CampaignEntry model)
    {
        _context.CampaignEntries.Add(model);
        _context.SaveChanges();
        return model;
    }

    public CampaignEntry Update(CampaignEntry model)
    {
        var existing = _context.CampaignEntries.Find(model.EntryId)
            ?? throw new KeyNotFoundException($"CampaignEntry {model.EntryId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long entryId)
    {
        var entity = _context.CampaignEntries.Find(entryId)
            ?? throw new KeyNotFoundException($"CampaignEntry {entryId} not found.");
        _context.CampaignEntries.Remove(entity);
        _context.SaveChanges();
    }
}
