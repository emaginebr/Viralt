using System.Collections.Generic;

namespace Core.Domain.Repository
{
    public interface ICampaignEntryOptionRepository<TModel, TFactory>
    {
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
        IEnumerable<TModel> ListOptions(long entryId, TFactory factory);
        TModel GetById(long optionId, TFactory factory);
        void Delete(long optionId, TFactory factory);
    }
}