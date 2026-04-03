namespace Viralt.Domain.Models;

public class Vote
{
    public long VoteId { get; set; }
    public long SubmissionId { get; set; }
    public string IpAddress { get; set; }
    public DateTime VotedAt { get; set; }

    public virtual Submission Submission { get; set; }
}
