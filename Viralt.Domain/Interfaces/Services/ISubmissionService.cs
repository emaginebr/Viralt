namespace Viralt.Domain.Interfaces.Services;

public interface ISubmissionService
{
    Viralt.DTO.Campaign.SubmissionInfo Submit(Viralt.DTO.Campaign.SubmissionInsertInfo dto);
    Viralt.DTO.Campaign.SubmissionInfo Approve(long submissionId);
    Viralt.DTO.Campaign.SubmissionInfo Reject(long submissionId);
    Viralt.DTO.Campaign.SubmissionInfo Vote(long submissionId, string ipAddress);
    IEnumerable<Viralt.DTO.Campaign.SubmissionInfo> ListByCampaign(long campaignId);
    IEnumerable<Viralt.DTO.Campaign.SubmissionInfo> ListApproved(long campaignId);
}
