using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Campaign;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class ReferralService : IReferralService
{
    private readonly IReferralRepository<Referral> _repository;
    private readonly IClientRepository<Client> _clientRepository;

    public ReferralService(IReferralRepository<Referral> repository, IClientRepository<Client> clientRepository)
    {
        _repository = repository;
        _clientRepository = clientRepository;
    }

    public ReferralInfo CreateReferral(long campaignId, long referrerClientId, long referredClientId, int bonusEntries)
    {
        var model = new Referral
        {
            CampaignId = campaignId,
            ReferrerClientId = referrerClientId,
            ReferredClientId = referredClientId,
            CreatedAt = DateTime.Now,
            BonusEntriesAwarded = bonusEntries
        };

        var saved = _repository.Insert(model);

        // Credit bonus entries to referrer
        if (bonusEntries > 0)
        {
            var referrer = _clientRepository.GetById(referrerClientId);
            if (referrer != null)
            {
                referrer.TotalEntries += bonusEntries;
                _clientRepository.Update(referrer);
            }
        }

        return MapToDto(saved);
    }

    public List<ReferralInfo> ListByCampaign(long campaignId)
    {
        return _repository.ListByCampaign(campaignId).Select(MapToDto).ToList();
    }

    public List<ReferralInfo> ListByReferrer(long clientId)
    {
        return _repository.ListByReferrer(clientId).Select(MapToDto).ToList();
    }

    private static ReferralInfo MapToDto(Referral model)
    {
        if (model == null) return null;
        return new ReferralInfo
        {
            ReferralId = model.ReferralId,
            CampaignId = model.CampaignId,
            ReferrerClientId = model.ReferrerClientId,
            ReferredClientId = model.ReferredClientId,
            CreatedAt = model.CreatedAt,
            BonusEntriesAwarded = model.BonusEntriesAwarded,
            ReferrerName = model.ReferrerClient?.Name,
            ReferredName = model.ReferredClient?.Name
        };
    }
}
