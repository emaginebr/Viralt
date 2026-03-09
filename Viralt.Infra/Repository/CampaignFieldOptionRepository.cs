using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class CampaignFieldOptionRepository : ICampaignFieldOptionRepository<CampaignFieldOption>
{
    private readonly ViraltContext _context;

    public CampaignFieldOptionRepository(ViraltContext context)
    {
        _context = context;
    }

    public CampaignFieldOption GetById(long optionId)
    {
        return _context.CampaignFieldOptions.Find(optionId);
    }

    public IEnumerable<CampaignFieldOption> ListOptions(long fieldId)
    {
        return _context.CampaignFieldOptions.Where(x => x.FieldId == fieldId).ToList();
    }

    public CampaignFieldOption Insert(CampaignFieldOption model)
    {
        _context.CampaignFieldOptions.Add(model);
        _context.SaveChanges();
        return model;
    }

    public CampaignFieldOption Update(CampaignFieldOption model)
    {
        var existing = _context.CampaignFieldOptions.Find(model.OptionId)
            ?? throw new KeyNotFoundException($"CampaignFieldOption {model.OptionId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long optionId)
    {
        var entity = _context.CampaignFieldOptions.Find(optionId)
            ?? throw new KeyNotFoundException($"CampaignFieldOption {optionId} not found.");
        _context.CampaignFieldOptions.Remove(entity);
        _context.SaveChanges();
    }
}
