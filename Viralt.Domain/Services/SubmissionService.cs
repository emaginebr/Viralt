using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Campaign;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class SubmissionService : ISubmissionService
{
    private readonly ISubmissionRepository<Submission> _repository;
    private readonly IVoteRepository<Vote> _voteRepository;

    public SubmissionService(
        ISubmissionRepository<Submission> repository,
        IVoteRepository<Vote> voteRepository)
    {
        _repository = repository;
        _voteRepository = voteRepository;
    }

    public SubmissionInfo Submit(SubmissionInsertInfo dto)
    {
        var model = MapToModel(dto);
        model.Status = 0; // Pending
        model.SubmittedAt = DateTime.Now;
        model.VoteCount = 0;
        var saved = _repository.Insert(model);
        return MapToDto(saved);
    }

    public SubmissionInfo Approve(long submissionId)
    {
        var model = _repository.GetById(submissionId);
        if (model == null) return null;

        model.Status = 1; // Approved
        var updated = _repository.Update(model);
        return MapToDto(updated);
    }

    public SubmissionInfo Reject(long submissionId)
    {
        var model = _repository.GetById(submissionId);
        if (model == null) return null;

        model.Status = 2; // Rejected
        var updated = _repository.Update(model);
        return MapToDto(updated);
    }

    public SubmissionInfo Vote(long submissionId, string ipAddress)
    {
        if (_voteRepository.ExistsBySubmissionAndIp(submissionId, ipAddress))
            return null;

        var submission = _repository.GetById(submissionId);
        if (submission == null) return null;

        var vote = new Vote
        {
            SubmissionId = submissionId,
            IpAddress = ipAddress,
            VotedAt = DateTime.Now
        };
        _voteRepository.Insert(vote);

        submission.VoteCount += 1;
        var updated = _repository.Update(submission);
        return MapToDto(updated);
    }

    public IEnumerable<SubmissionInfo> ListByCampaign(long campaignId)
    {
        return _repository.ListByCampaign(campaignId).Select(MapToDto);
    }

    public IEnumerable<SubmissionInfo> ListApproved(long campaignId)
    {
        return _repository.ListByCampaign(campaignId)
            .Where(s => s.Status == 1)
            .Select(MapToDto);
    }

    private static SubmissionInfo MapToDto(Submission model)
    {
        if (model == null) return null;
        return new SubmissionInfo
        {
            SubmissionId = model.SubmissionId,
            CampaignId = model.CampaignId,
            ClientId = model.ClientId,
            FileUrl = model.FileUrl,
            FileType = model.FileType,
            Caption = model.Caption,
            Status = model.Status,
            VoteCount = model.VoteCount,
            JudgeScore = model.JudgeScore,
            SubmittedAt = model.SubmittedAt
        };
    }

    private static Submission MapToModel(SubmissionInsertInfo dto) => new()
    {
        CampaignId = dto.CampaignId,
        ClientId = dto.ClientId,
        FileUrl = dto.FileUrl,
        FileType = dto.FileType,
        Caption = dto.Caption
    };
}
