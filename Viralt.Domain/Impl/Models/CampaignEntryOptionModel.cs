using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Core.Domain.Repository;

namespace Viralt.Domain.Impl.Models
{
    public class CampaignEntryOptionModel : ICampaignEntryOptionModel
    {
        private readonly ICampaignEntryOptionRepository<ICampaignEntryOptionModel, ICampaignEntryOptionDomainFactory> _repository;

        public CampaignEntryOptionModel(ICampaignEntryOptionRepository<ICampaignEntryOptionModel, ICampaignEntryOptionDomainFactory> repository)
        {
            _repository = repository;
        }

        public long OptionId { get; set; }
        public long EntryId { get; set; }
        public string OptionKey { get; set; }
        public string OptionValue { get; set; }

        public ICampaignEntryOptionModel Insert(ICampaignEntryOptionDomainFactory factory)
        {
            return _repository.Insert(this, factory);
        }

        public ICampaignEntryOptionModel Update(ICampaignEntryOptionDomainFactory factory)
        {
            return _repository.Update(this, factory);
        }

        public ICampaignEntryOptionModel GetById(long optionId, ICampaignEntryOptionDomainFactory factory)
        {
            return _repository.GetById(optionId, factory);
        }

        public IEnumerable<ICampaignEntryOptionModel> ListOptions(long entryId, ICampaignEntryOptionDomainFactory factory)
        {
            return _repository.ListOptions(entryId, factory);
        }

        public void Delete(long optionId, ICampaignEntryOptionDomainFactory factory)
        {
            _repository.Delete(optionId, factory);
        }
    }
}