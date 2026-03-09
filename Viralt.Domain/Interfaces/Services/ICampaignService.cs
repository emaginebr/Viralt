using Viralt.DTO.Campaign;

namespace Viralt.Domain.Interfaces.Services;

public interface ICampaignService
{
    CampaignInfo Insert(CampaignInfo campaign);
    CampaignInfo Update(CampaignInfo campaign);
    CampaignInfo GetById(long campaignId);
    List<CampaignInfo> ListCampaigns(int take);
    void Delete(long campaignId);
    List<CampaignInfo> ListByUser(long userId);
}
