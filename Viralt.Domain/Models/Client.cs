namespace Viralt.Domain.Models;

public class Client
{
    public long ClientId { get; set; }
    public long CampaignId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Token { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public DateTime? Birthday { get; set; }
    public int? Status { get; set; }

    public virtual Campaign Campaign { get; set; }
    public virtual ICollection<ClientEntry> ClientEntries { get; set; } = new List<ClientEntry>();
}
