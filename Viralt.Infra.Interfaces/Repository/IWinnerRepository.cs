namespace Viralt.Infra.Interfaces.Repository;

public interface IWinnerRepository<TModel> where TModel : class
{
    TModel GetById(long winnerId);
    IEnumerable<TModel> ListByCampaign(long campaignId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long winnerId);
}
