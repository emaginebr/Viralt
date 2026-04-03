namespace Viralt.Infra.Interfaces.Repository;

public interface IWebhookRepository<TModel> where TModel : class
{
    TModel GetById(long webhookId);
    IEnumerable<TModel> ListByUser(long userId);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long webhookId);
}
