using Core.Domain.Repository;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Impl.Models;

namespace Viralt.Domain.Impl.Factory
{
    public class CampaignFieldOptionDomainFactory : ICampaignFieldOptionDomainFactory
    {
        private readonly ICampaignFieldOptionRepository<ICampaignFieldOptionModel, ICampaignFieldOptionDomainFactory> _repository;

        public CampaignFieldOptionDomainFactory(ICampaignFieldOptionRepository<ICampaignFieldOptionModel, ICampaignFieldOptionDomainFactory> repository)
        {
            _repository = repository;
        }

        public ICampaignFieldOptionModel BuildCampaignFieldOptionModel()
        {
            return new CampaignFieldOptionModel(_repository);
        }
    }
}