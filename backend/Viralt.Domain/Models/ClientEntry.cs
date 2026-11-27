namespace Viralt.Domain.Models;

public class ClientEntry
{
    public long ClientEntryId { get; set; }
    public long ClientId { get; set; }
    public long EntryId { get; set; }
    public int Status { get; set; }
    public string EntryValue { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool Verified { get; set; }
    public string VerificationData { get; set; }
    public int EntriesEarned { get; set; }

    public virtual Client Client { get; set; }
    public virtual CampaignEntry Entry { get; set; }
}
