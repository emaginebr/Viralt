namespace Viralt.Domain.Models;

public class Winner
{
    public long WinnerId { get; set; }
    public long CampaignId { get; set; }
    public long ClientId { get; set; }
    public long? PrizeId { get; set; }
    public DateTime SelectedAt { get; set; }
    public int SelectionMethod { get; set; }
    public bool Notified { get; set; }
    public bool Claimed { get; set; }
    public string ClaimData { get; set; }

    public virtual Campaign Campaign { get; set; }
    public virtual Client Client { get; set; }
    public virtual Prize Prize { get; set; }
}
