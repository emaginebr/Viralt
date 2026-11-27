namespace Viralt.Domain.Models;

public class UnlockReward
{
    public long RewardId { get; set; }
    public long CampaignId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public int EntriesThreshold { get; set; }
    public int RewardType { get; set; }
    public string RewardValue { get; set; }
    public string Image { get; set; }

    public virtual Campaign Campaign { get; set; }
    public virtual ICollection<ClientReward> ClientRewards { get; set; } = new List<ClientReward>();
}
