namespace Viralt.Domain.Models;

public class CampaignView
{
    public long ViewId { get; set; }
    public long CampaignId { get; set; }
    public DateTime ViewedAt { get; set; }
    public string IpAddress { get; set; }
    public string UserAgent { get; set; }
    public string Referrer { get; set; }
    public string CountryCode { get; set; }

    public virtual Campaign Campaign { get; set; }
}
