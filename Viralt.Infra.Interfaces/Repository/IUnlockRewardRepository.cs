namespace Viralt.Infra.Interfaces.Repository;

public interface IUnlockRewardRepository<TModel> where TModel : class
{
    TModel GetById(long rewardId);
    IEnumerable<TModel> ListByCampaign(long campaignId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long rewardId);
}
