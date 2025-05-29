using Core.Domain.Repository;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Impl.Models;

namespace Viralt.Domain.Impl.Factory
{
    public class ClientEntryDomainFactory : IClientEntryDomainFactory
    {
        private readonly IClientEntryRepository<IClientEntryModel, IClientEntryDomainFactory> _repository;

        public ClientEntryDomainFactory(IClientEntryRepository<IClientEntryModel, IClientEntryDomainFactory> repository)
        {
            _repository = repository;
        }

        public IClientEntryModel BuildClientEntryModel()
        {
            return new ClientEntryModel(_repository);
        }
    }
}