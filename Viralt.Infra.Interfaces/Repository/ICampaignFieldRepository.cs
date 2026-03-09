namespace Viralt.Infra.Interfaces.Repository;

public interface ICampaignFieldRepository<TModel> where TModel : class
{
    TModel GetById(long fieldId);
    IEnumerable<TModel> ListFields(long campaignId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long fieldId);
}
