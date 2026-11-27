namespace Viralt.Domain.Models;

public class Submission
{
    public long SubmissionId { get; set; }
    public long CampaignId { get; set; }
    public long ClientId { get; set; }
    public string FileUrl { get; set; }
    public int FileType { get; set; }
    public string Caption { get; set; }
    public int Status { get; set; }
    public int VoteCount { get; set; }
    public decimal? JudgeScore { get; set; }
    public DateTime SubmittedAt { get; set; }

    public virtual Campaign Campaign { get; set; }
    public virtual Client Client { get; set; }
    public virtual ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
