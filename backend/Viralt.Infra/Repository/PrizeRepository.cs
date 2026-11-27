using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class PrizeRepository : IPrizeRepository<Prize>
{
    private readonly ViraltContext _context;

    public PrizeRepository(ViraltContext context)
    {
        _context = context;
    }

    public Prize GetById(long prizeId)
    {
        return _context.Prizes.Find(prizeId);
    }

    public IEnumerable<Prize> ListByCampaign(long campaignId)
    {
        return _context.Prizes.Where(x => x.CampaignId == campaignId).ToList();
    }

    public Prize Insert(Prize model)
    {
        _context.Prizes.Add(model);
        _context.SaveChanges();
        return model;
    }

    public Prize Update(Prize model)
    {
        var existing = _context.Prizes.Find(model.PrizeId);
        if (existing == null)
            throw new KeyNotFoundException($"Prize {model.PrizeId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long prizeId)
    {
        var entity = _context.Prizes.Find(prizeId)
            ?? throw new KeyNotFoundException($"Prize {prizeId} not found.");
        _context.Prizes.Remove(entity);
        _context.SaveChanges();
    }
}
