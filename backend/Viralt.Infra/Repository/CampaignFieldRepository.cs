using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class CampaignFieldRepository : ICampaignFieldRepository<CampaignField>
{
    private readonly ViraltContext _context;

    public CampaignFieldRepository(ViraltContext context)
    {
        _context = context;
    }

    public CampaignField GetById(long fieldId)
    {
        return _context.CampaignFields.Find(fieldId);
    }

    public IEnumerable<CampaignField> ListFields(long campaignId)
    {
        return _context.CampaignFields.Where(x => x.CampaignId == campaignId).ToList();
    }

    public CampaignField Insert(CampaignField model)
    {
        _context.CampaignFields.Add(model);
        _context.SaveChanges();
        return model;
    }

    public CampaignField Update(CampaignField model)
    {
        var existing = _context.CampaignFields.Find(model.FieldId)
            ?? throw new KeyNotFoundException($"CampaignField {model.FieldId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long fieldId)
    {
        var entity = _context.CampaignFields.Find(fieldId)
            ?? throw new KeyNotFoundException($"CampaignField {fieldId} not found.");
        _context.CampaignFields.Remove(entity);
        _context.SaveChanges();
    }
}
