namespace Viralt.Domain.Models;

public class Referral
{
    public long ReferralId { get; set; }
    public long CampaignId { get; set; }
    public long ReferrerClientId { get; set; }
    public long ReferredClientId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int BonusEntriesAwarded { get; set; }

    public virtual Campaign Campaign { get; set; }
    public virtual Client ReferrerClient { get; set; }
    public virtual Client ReferredClient { get; set; }
}
