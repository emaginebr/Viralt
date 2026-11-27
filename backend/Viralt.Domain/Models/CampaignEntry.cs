namespace Viralt.Domain.Models;

public class CampaignEntry
{
    public long EntryId { get; set; }
    public long CampaignId { get; set; }
    public int EntryType { get; set; }
    public string Title { get; set; }
    public int Entries { get; set; }
    public bool Daily { get; set; }
    public bool Mandatory { get; set; }
    public string EntryLabel { get; set; }
    public string EntryValue { get; set; }
    public int SortOrder { get; set; }
    public string Icon { get; set; }
    public string Instructions { get; set; }
    public bool RequireVerification { get; set; }
    public string TargetUrl { get; set; }
    public string ExternalProvider { get; set; }
    public string ExternalEntryId { get; set; }

    public virtual Campaign Campaign { get; set; }
    public virtual ICollection<CampaignEntryOption> CampaignEntryOptions { get; set; } = new List<CampaignEntryOption>();
    public virtual ClientEntry ClientEntry { get; set; }
}
