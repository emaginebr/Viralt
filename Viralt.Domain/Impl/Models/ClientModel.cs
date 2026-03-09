using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Core.Domain.Repository;

namespace Viralt.Domain.Impl.Models
{
    public class ClientModel : IClientModel
    {
        private readonly IClientRepository<IClientModel, IClientDomainFactory> _repository;

        public ClientModel(IClientRepository<IClientModel, IClientDomainFactory> repository)
        {
            _repository = repository;
        }

        public long ClientId { get; set; }
        public long CampaignId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Token { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public DateTime? Birthday { get; set; }
        public int? Status { get; set; }

        public IClientModel Insert(IClientDomainFactory factory)
        {
            return _repository.Insert(this, factory);
        }

        public IClientModel Update(IClientDomainFactory factory)
        {
            return _repository.Update(this, factory);
        }

        public IClientModel GetById(long clientId, IClientDomainFactory factory)
        {
            return _repository.GetById(clientId, factory);
        }

        public IEnumerable<IClientModel> ListClients(long campaignId, IClientDomainFactory factory)
        {
            return _repository.ListClients(campaignId, factory);
        }

        public void Delete(long clientId, IClientDomainFactory factory)
        {
            _repository.Delete(clientId, factory);
        }
    }
}