using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class SubmissionRepository : ISubmissionRepository<Submission>
{
    private readonly ViraltContext _context;

    public SubmissionRepository(ViraltContext context)
    {
        _context = context;
    }

    public Submission GetById(long submissionId)
    {
        return _context.Submissions.Find(submissionId);
    }

    public IEnumerable<Submission> ListByCampaign(long campaignId)
    {
        return _context.Submissions.Where(x => x.CampaignId == campaignId).ToList();
    }

    public Submission Insert(Submission model)
    {
        _context.Submissions.Add(model);
        _context.SaveChanges();
        return model;
    }

    public Submission Update(Submission model)
    {
        var existing = _context.Submissions.Find(model.SubmissionId);
        if (existing == null)
            throw new KeyNotFoundException($"Submission {model.SubmissionId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long submissionId)
    {
        var entity = _context.Submissions.Find(submissionId)
            ?? throw new KeyNotFoundException($"Submission {submissionId} not found.");
        _context.Submissions.Remove(entity);
        _context.SaveChanges();
    }
}
