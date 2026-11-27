namespace Viralt.Infra.Interfaces.Repository;

public interface ICampaignRepository<TModel> where TModel : class
{
    TModel GetById(long campaignId);
    TModel GetBySlug(string slug);
    IEnumerable<TModel> ListCampaigns(int take);
    IEnumerable<TModel> ListByUser(long userId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long campaignId);
}
