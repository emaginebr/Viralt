namespace Viralt.Infra.Interfaces.Repository;

public interface IClientEntryRepository<TModel> where TModel : class
{
    TModel GetById(long clientEntryId);
    IEnumerable<TModel> ListByClient(long clientId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long clientEntryId);
}
