using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Core.Domain.Repository;

namespace Viralt.Domain.Impl.Models
{
    public class ClientEntryModel : IClientEntryModel
    {
        private readonly IClientEntryRepository<IClientEntryModel, IClientEntryDomainFactory> _repository;

        public ClientEntryModel(IClientEntryRepository<IClientEntryModel, IClientEntryDomainFactory> repository)
        {
            _repository = repository;
        }

        public long ClientEntryId { get; set; }
        public long ClientId { get; set; }
        public long EntryId { get; set; }
        public int Status { get; set; }
        public string EntryValue { get; set; }

        public IClientEntryModel Insert(IClientEntryDomainFactory factory)
        {
            return _repository.Insert(this, factory);
        }

        public IClientEntryModel Update(IClientEntryDomainFactory factory)
        {
            return _repository.Update(this, factory);
        }

        public IClientEntryModel GetById(long clientEntryId, IClientEntryDomainFactory factory)
        {
            return _repository.GetById(clientEntryId, factory);
        }

        public IEnumerable<IClientEntryModel> ListByClient(long clientId, IClientEntryDomainFactory factory)
        {
            return _repository.ListByClient(clientId, factory);
        }

        public void Delete(long clientEntryId, IClientEntryDomainFactory factory)
        {
            _repository.Delete(clientEntryId, factory);
        }
    }
}