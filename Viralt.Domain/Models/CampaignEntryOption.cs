namespace Viralt.Domain.Models;

public class CampaignEntryOption
{
    public long OptionId { get; set; }
    public long EntryId { get; set; }
    public string OptionKey { get; set; }
    public string OptionValue { get; set; }

    public virtual CampaignEntry Entry { get; set; }
}
