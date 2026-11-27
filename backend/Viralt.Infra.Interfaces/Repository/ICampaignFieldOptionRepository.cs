namespace Viralt.Infra.Interfaces.Repository;

public interface ICampaignFieldOptionRepository<TModel> where TModel : class
{
    TModel GetById(long optionId);
    IEnumerable<TModel> ListOptions(long fieldId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long optionId);
}
