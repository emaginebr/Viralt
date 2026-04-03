using Viralt.DTO.Campaign;

namespace Viralt.Domain.Interfaces.Services;

public interface IReferralService
{
    ReferralInfo CreateReferral(long campaignId, long referrerClientId, long referredClientId, int bonusEntries);
    List<ReferralInfo> ListByCampaign(long campaignId);
    List<ReferralInfo> ListByReferrer(long clientId);
}
