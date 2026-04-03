namespace Viralt.Infra.Interfaces.Repository;

public interface IPrizeRepository<TModel> where TModel : class
{
    TModel GetById(long prizeId);
    IEnumerable<TModel> ListByCampaign(long campaignId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long prizeId);
}
