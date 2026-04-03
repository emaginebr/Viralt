namespace Viralt.Infra.Interfaces.Repository;

public interface IVoteRepository<TModel> where TModel : class
{
    TModel Insert(TModel model);
    bool ExistsBySubmissionAndIp(long submissionId, string ipAddress);
}
