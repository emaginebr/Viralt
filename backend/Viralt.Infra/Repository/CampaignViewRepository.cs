using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class CampaignViewRepository : ICampaignViewRepository<CampaignView>
{
    private readonly ViraltContext _context;

    public CampaignViewRepository(ViraltContext context)
    {
        _context = context;
    }

    public CampaignView Insert(CampaignView model)
    {
        _context.CampaignViews.Add(model);
        _context.SaveChanges();
        return model;
    }

    public IEnumerable<CampaignView> ListByCampaign(long campaignId)
    {
        return _context.CampaignViews.Where(x => x.CampaignId == campaignId).ToList();
    }
}
