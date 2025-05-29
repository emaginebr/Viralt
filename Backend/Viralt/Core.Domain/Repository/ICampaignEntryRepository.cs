using System.Collections.Generic;

namespace Core.Domain.Repository
{
    public interface ICampaignEntryRepository<TModel, TFactory>
    {
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
        IEnumerable<TModel> ListEntries(long campaignId, TFactory factory);
        TModel GetById(long entryId, TFactory factory);
        void Delete(long entryId, TFactory factory);
    }
}