namespace Viralt.Infra.Interfaces.Repository;

public interface ICampaignEntryRepository<TModel> where TModel : class
{
    TModel GetById(long entryId);
    IEnumerable<TModel> ListEntries(long campaignId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long entryId);
}
