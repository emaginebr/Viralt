using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Core.Domain.Repository;

namespace Viralt.Domain.Impl.Models
{
    public class CampaignEntryModel : ICampaignEntryModel
    {
        private readonly ICampaignEntryRepository<ICampaignEntryModel, ICampaignEntryDomainFactory> _repository;

        public CampaignEntryModel(ICampaignEntryRepository<ICampaignEntryModel, ICampaignEntryDomainFactory> repository)
        {
            _repository = repository;
        }

        public long EntryId { get; set; }
        public long CampaignId { get; set; }
        public int EntryType { get; set; }
        public string Title { get; set; }
        public int Entries { get; set; }
        public bool Daily { get; set; }
        public bool Mandatory { get; set; }
        public string EntryLabel { get; set; }
        public string EntryValue { get; set; }

        public ICampaignEntryModel Insert(ICampaignEntryDomainFactory factory)
        {
            return _repository.Insert(this, factory);
        }

        public ICampaignEntryModel Update(ICampaignEntryDomainFactory factory)
        {
            return _repository.Update(this, factory);
        }

        public ICampaignEntryModel GetById(long entryId, ICampaignEntryDomainFactory factory)
        {
            return _repository.GetById(entryId, factory);
        }

        public IEnumerable<ICampaignEntryModel> ListEntries(long campaignId, ICampaignEntryDomainFactory factory)
        {
            return _repository.ListEntries(campaignId, factory);
        }

        public void Delete(long entryId, ICampaignEntryDomainFactory factory)
        {
            _repository.Delete(entryId, factory);
        }
    }
}