using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class ClientRewardRepository : IClientRewardRepository<ClientReward>
{
    private readonly ViraltContext _context;

    public ClientRewardRepository(ViraltContext context)
    {
        _context = context;
    }

    public ClientReward GetById(long clientRewardId)
    {
        return _context.ClientRewards.Find(clientRewardId);
    }

    public IEnumerable<ClientReward> ListByClient(long clientId)
    {
        return _context.ClientRewards.Where(x => x.ClientId == clientId).ToList();
    }

    public IEnumerable<ClientReward> ListByReward(long rewardId)
    {
        return _context.ClientRewards.Where(x => x.RewardId == rewardId).ToList();
    }

    public ClientReward Insert(ClientReward model)
    {
        _context.ClientRewards.Add(model);
        _context.SaveChanges();
        return model;
    }

    public void Delete(long clientRewardId)
    {
        var entity = _context.ClientRewards.Find(clientRewardId)
            ?? throw new KeyNotFoundException($"ClientReward {clientRewardId} not found.");
        _context.ClientRewards.Remove(entity);
        _context.SaveChanges();
    }
}
