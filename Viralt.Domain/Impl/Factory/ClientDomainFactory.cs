using Core.Domain.Repository;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Impl.Models;

namespace Viralt.Domain.Impl.Factory
{
    public class ClientDomainFactory : IClientDomainFactory
    {
        private readonly IClientRepository<IClientModel, IClientDomainFactory> _repository;

        public ClientDomainFactory(IClientRepository<IClientModel, IClientDomainFactory> repository)
        {
            _repository = repository;
        }

        public IClientModel BuildClientModel()
        {
            return new ClientModel(_repository);
        }
    }
}