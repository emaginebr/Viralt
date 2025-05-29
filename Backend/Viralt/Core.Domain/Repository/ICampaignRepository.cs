using System.Collections.Generic;

namespace Core.Domain.Repository
{
    public interface ICampaignRepository<TModel, TFactory>
    {
        TModel Insert(TModel model, TFactory factory);
        TModel Update(TModel model, TFactory factory);
        IEnumerable<TModel> ListCampaigns(int take, TFactory factory);
        TModel GetById(long campaignId, TFactory factory);
        void Delete(long campaignId, TFactory factory);
    }
}