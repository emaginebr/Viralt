using System.Collections.Generic;

namespace Core.Domain.Repository
{
    public interface ICampaignFieldOptionRepository<TModel, TFactory>
    {
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
        IEnumerable<TModel> ListOptions(long fieldId, TFactory factory);
        TModel GetById(long optionId, TFactory factory);
        void Delete(long optionId, TFactory factory);
    }
}