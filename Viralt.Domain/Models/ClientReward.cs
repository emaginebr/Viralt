namespace Viralt.Domain.Models;

public class ClientReward
{
    public long ClientRewardId { get; set; }
    public long ClientId { get; set; }
    public long RewardId { get; set; }
    public DateTime UnlockedAt { get; set; }

    public virtual Client Client { get; set; }
    public virtual UnlockReward Reward { get; set; }
}
