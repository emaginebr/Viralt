using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class UnlockRewardRepository : IUnlockRewardRepository<UnlockReward>
{
    private readonly ViraltContext _context;

    public UnlockRewardRepository(ViraltContext context)
    {
        _context = context;
    }

    public UnlockReward GetById(long rewardId)
    {
        return _context.UnlockRewards.Find(rewardId);
    }

    public IEnumerable<UnlockReward> ListByCampaign(long campaignId)
    {
        return _context.UnlockRewards.Where(x => x.CampaignId == campaignId).ToList();
    }

    public UnlockReward Insert(UnlockReward model)
    {
        _context.UnlockRewards.Add(model);
        _context.SaveChanges();
        return model;
    }

    public UnlockReward Update(UnlockReward model)
    {
        var existing = _context.UnlockRewards.Find(model.RewardId);
        if (existing == null)
            throw new KeyNotFoundException($"UnlockReward {model.RewardId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long rewardId)
    {
        var entity = _context.UnlockRewards.Find(rewardId)
            ?? throw new KeyNotFoundException($"UnlockReward {rewardId} not found.");
        _context.UnlockRewards.Remove(entity);
        _context.SaveChanges();
    }
}
