using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class ReferralRepository : IReferralRepository<Referral>
{
    private readonly ViraltContext _context;

    public ReferralRepository(ViraltContext context)
    {
        _context = context;
    }

    public Referral GetById(long referralId)
    {
        return _context.Referrals.Find(referralId);
    }

    public IEnumerable<Referral> ListByCampaign(long campaignId)
    {
        return _context.Referrals.Where(x => x.CampaignId == campaignId).ToList();
    }

    public IEnumerable<Referral> ListByReferrer(long referrerClientId)
    {
        return _context.Referrals.Where(x => x.ReferrerClientId == referrerClientId).ToList();
    }

    public Referral Insert(Referral model)
    {
        _context.Referrals.Add(model);
        _context.SaveChanges();
        return model;
    }
}
