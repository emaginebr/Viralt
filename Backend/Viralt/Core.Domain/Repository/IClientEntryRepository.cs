using System.Collections.Generic;

namespace Core.Domain.Repository
{
    public interface IClientEntryRepository<TModel, TFactory>
    {
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
        IEnumerable<TModel> ListByClient(long clientId, TFactory factory);
        TModel GetById(long clientEntryId, TFactory factory);
        void Delete(long clientEntryId, TFactory factory);
    }
}