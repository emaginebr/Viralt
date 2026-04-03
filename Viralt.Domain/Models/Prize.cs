namespace Viralt.Domain.Models;

public class Prize
{
    public long PrizeId { get; set; }
    public long CampaignId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Image { get; set; }
    public int Quantity { get; set; }
    public int PrizeType { get; set; }
    public string CouponCode { get; set; }
    public int SortOrder { get; set; }
    public int? MinEntriesRequired { get; set; }

    public virtual Campaign Campaign { get; set; }
    public virtual ICollection<Winner> Winners { get; set; } = new List<Winner>();
}
