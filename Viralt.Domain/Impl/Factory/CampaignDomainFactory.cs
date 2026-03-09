using Core.Domain;
using Core.Domain.Repository;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Impl.Models;

namespace Viralt.Domain.Impl.Factory
{
    public class CampaignDomainFactory : ICampaignDomainFactory
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICampaignRepository<ICampaignModel, ICampaignDomainFactory> _repositoryCampaign;

        public CampaignDomainFactory(IUnitOfWork unitOfWork, ICampaignRepository<ICampaignModel, ICampaignDomainFactory> repositoryCampaign)
        {
            _unitOfWork = unitOfWork;
            _repositoryCampaign = repositoryCampaign;
        }

        public ICampaignModel BuildCampaignModel()
        {
            return new CampaignModel(_repositoryCampaign);
        }
    }
}