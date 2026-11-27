namespace Viralt.Domain.Models;

public class CampaignField
{
    public long FieldId { get; set; }
    public long CampaignId { get; set; }
    public int FieldType { get; set; }
    public string Title { get; set; }
    public bool Required { get; set; }

    public virtual Campaign Campaign { get; set; }
    public virtual ICollection<CampaignFieldOption> CampaignFieldOptions { get; set; } = new List<CampaignFieldOption>();
}
