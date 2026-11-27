namespace Viralt.Infra.Interfaces.Repository;

public interface ICampaignViewRepository<TModel> where TModel : class
{
    TModel Insert(TModel model);
    IEnumerable<TModel> ListByCampaign(long campaignId);
}
