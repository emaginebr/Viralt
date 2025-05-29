using System.Collections.Generic;
using System.Linq;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Interfaces.Services;
using Core.Domain.Repository;

namespace Viralt.Domain.Impl.Services
{
    public class ClientService : IClientService
    {
        private readonly IClientRepository<IClientModel, IClientDomainFactory> _repository;
        private readonly IClientDomainFactory _factory;

        public ClientService(
            IClientRepository<IClientModel, IClientDomainFactory> repository,
            IClientDomainFactory factory)
        {
            _repository = repository;
            _factory = factory;
        }

        public IClientModel Insert(IClientModel model)
        {
            return _repository.Insert(model, _factory);
        }

        public IClientModel Update(IClientModel model)
        {
            return _repository.Update(model, _factory);
        }

        public IClientModel GetById(long clientId)
        {
            return _repository.GetById(clientId, _factory);
        }

        public IEnumerable<IClientModel> ListByCampaign(long campaignId)
        {
            return _repository.ListClients(campaignId, _factory);
        }

        public void Delete(long clientId)
        {
            _repository.Delete(clientId, _factory);
        }
    }
}