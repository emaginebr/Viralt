using Core.Domain.Repository;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Impl.Models;

namespace Viralt.Domain.Impl.Factory
{
    public class CampaignFieldDomainFactory : ICampaignFieldDomainFactory
    {
        private readonly ICampaignFieldRepository<ICampaignFieldModel, ICampaignFieldDomainFactory> _repository;

        public CampaignFieldDomainFactory(ICampaignFieldRepository<ICampaignFieldModel, ICampaignFieldDomainFactory> repository)
        {
            _repository = repository;
        }

        public ICampaignFieldModel BuildCampaignFieldModel()
        {
            return new CampaignFieldModel(_repository);
        }
    }
}