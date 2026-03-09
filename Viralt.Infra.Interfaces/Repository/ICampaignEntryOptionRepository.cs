namespace Viralt.Infra.Interfaces.Repository;

public interface ICampaignEntryOptionRepository<TModel> where TModel : class
{
    TModel GetById(long optionId);
    IEnumerable<TModel> ListOptions(long entryId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long optionId);
}
