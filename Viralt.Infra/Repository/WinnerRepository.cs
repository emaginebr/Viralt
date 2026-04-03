using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class WinnerRepository : IWinnerRepository<Winner>
{
    private readonly ViraltContext _context;

    public WinnerRepository(ViraltContext context)
    {
        _context = context;
    }

    public Winner GetById(long winnerId)
    {
        return _context.Winners.Find(winnerId);
    }

    public IEnumerable<Winner> ListByCampaign(long campaignId)
    {
        return _context.Winners.Where(x => x.CampaignId == campaignId).ToList();
    }

    public Winner Insert(Winner model)
    {
        _context.Winners.Add(model);
        _context.SaveChanges();
        return model;
    }

    public Winner Update(Winner model)
    {
        var existing = _context.Winners.Find(model.WinnerId)
            ?? throw new KeyNotFoundException($"Winner {model.WinnerId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long winnerId)
    {
        var entity = _context.Winners.Find(winnerId)
            ?? throw new KeyNotFoundException($"Winner {winnerId} not found.");
        _context.Winners.Remove(entity);
        _context.SaveChanges();
    }
}
