namespace Viralt.Infra.Interfaces.Repository;

public interface ISubmissionRepository<TModel> where TModel : class
{
    TModel GetById(long submissionId);
    IEnumerable<TModel> ListByCampaign(long campaignId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long submissionId);
}
