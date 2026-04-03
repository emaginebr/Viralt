using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class VoteRepository : IVoteRepository<Vote>
{
    private readonly ViraltContext _context;

    public VoteRepository(ViraltContext context)
    {
        _context = context;
    }

    public Vote Insert(Vote model)
    {
        _context.Votes.Add(model);
        _context.SaveChanges();
        return model;
    }

    public bool ExistsBySubmissionAndIp(long submissionId, string ipAddress)
    {
        return _context.Votes.Any(v => v.SubmissionId == submissionId && v.IpAddress == ipAddress);
    }
}
