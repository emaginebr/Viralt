using Core.Domain.Repository;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Impl.Models;

namespace Viralt.Domain.Impl.Factory
{
    public class CampaignEntryOptionDomainFactory : ICampaignEntryOptionDomainFactory
    {
        private readonly ICampaignEntryOptionRepository<ICampaignEntryOptionModel, ICampaignEntryOptionDomainFactory> _repository;

        public CampaignEntryOptionDomainFactory(ICampaignEntryOptionRepository<ICampaignEntryOptionModel, ICampaignEntryOptionDomainFactory> repository)
        {
            _repository = repository;
        }

        public ICampaignEntryOptionModel BuildCampaignEntryOptionModel()
        {
            return new CampaignEntryOptionModel(_repository);
        }
    }
}