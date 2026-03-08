using System.Collections.Generic;
using Viralt.Domain.Interfaces.Models;

namespace Viralt.Domain.Interfaces.Services
{
    public interface ICampaignService
    {
        ICampaignModel Insert(ICampaignModel model);
        ICampaignModel Update(ICampaignModel model);
        ICampaignModel GetById(long campaignId);
        IEnumerable<ICampaignModel> ListCampaigns(int take);
        void Delete(long campaignId);
        IEnumerable<ICampaignModel> ListByUser(long userId);
    }
}