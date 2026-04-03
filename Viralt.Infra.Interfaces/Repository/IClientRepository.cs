namespace Viralt.Infra.Interfaces.Repository;

public interface IClientRepository<TModel> where TModel : class
{
    TModel GetById(long clientId);
    TModel GetByToken(string token);
    TModel GetByEmail(long campaignId, string email);
    IEnumerable<TModel> ListClients(long campaignId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long clientId);
}
