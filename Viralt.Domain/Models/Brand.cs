namespace Viralt.Domain.Models;

public class Brand
{
    public long BrandId { get; set; }
    public long UserId { get; set; }
    public string Name { get; set; }
    public string Slug { get; set; }
    public string LogoImage { get; set; }
    public string PrimaryColor { get; set; }
    public string CustomDomain { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Campaign> Campaigns { get; set; } = new List<Campaign>();
}
