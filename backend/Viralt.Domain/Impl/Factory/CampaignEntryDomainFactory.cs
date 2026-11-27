using Core.Domain.Repository;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Impl.Models;

namespace Viralt.Domain.Impl.Factory
{
    public class CampaignEntryDomainFactory : ICampaignEntryDomainFactory
    {
        private readonly ICampaignEntryRepository<ICampaignEntryModel, ICampaignEntryDomainFactory> _repository;

        public CampaignEntryDomainFactory(ICampaignEntryRepository<ICampaignEntryModel, ICampaignEntryDomainFactory> repository)
        {
            _repository = repository;
        }

        public ICampaignEntryModel BuildCampaignEntryModel()
        {
            return new CampaignEntryModel(_repository);
        }
    }
}