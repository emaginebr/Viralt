namespace Viralt.Infra.Interfaces.Repository;

public interface IClientRewardRepository<TModel> where TModel : class
{
    TModel GetById(long clientRewardId);
    IEnumerable<TModel> ListByClient(long clientId);
    IEnumerable<TModel> ListByReward(long rewardId);
    TModel Insert(TModel model);
    void Delete(long clientRewardId);
}
