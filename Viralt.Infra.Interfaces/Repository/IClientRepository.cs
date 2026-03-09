namespace Viralt.Infra.Interfaces.Repository;

public interface IClientRepository<TModel> where TModel : class
{
    TModel GetById(long clientId);
    IEnumerable<TModel> ListClients(long campaignId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long clientId);
}
