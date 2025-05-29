using System.Collections.Generic;

namespace Core.Domain.Repository
{
    public interface ICampaignFieldRepository<TModel, TFactory>
    {
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
        IEnumerable<TModel> ListFields(long campaignId, TFactory factory);
        TModel GetById(long fieldId, TFactory factory);
        void Delete(long fieldId, TFactory factory);
    }
}