using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class CampaignEntryOptionRepository : ICampaignEntryOptionRepository<CampaignEntryOption>
{
    private readonly ViraltContext _context;

    public CampaignEntryOptionRepository(ViraltContext context)
    {
        _context = context;
    }

    public CampaignEntryOption GetById(long optionId)
    {
        return _context.CampaignEntryOptions.Find(optionId);
    }

    public IEnumerable<CampaignEntryOption> ListOptions(long entryId)
    {
        return _context.CampaignEntryOptions.Where(x => x.EntryId == entryId).ToList();
    }

    public CampaignEntryOption Insert(CampaignEntryOption model)
    {
        _context.CampaignEntryOptions.Add(model);
        _context.SaveChanges();
        return model;
    }

    public CampaignEntryOption Update(CampaignEntryOption model)
    {
        var existing = _context.CampaignEntryOptions.Find(model.OptionId)
            ?? throw new KeyNotFoundException($"CampaignEntryOption {model.OptionId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long optionId)
    {
        var entity = _context.CampaignEntryOptions.Find(optionId)
            ?? throw new KeyNotFoundException($"CampaignEntryOption {optionId} not found.");
        _context.CampaignEntryOptions.Remove(entity);
        _context.SaveChanges();
    }
}
