using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Core.Domain.Repository;

namespace Viralt.Domain.Impl.Models
{
    public class CampaignFieldOptionModel : ICampaignFieldOptionModel
    {
        private readonly ICampaignFieldOptionRepository<ICampaignFieldOptionModel, ICampaignFieldOptionDomainFactory> _repository;

        public CampaignFieldOptionModel(ICampaignFieldOptionRepository<ICampaignFieldOptionModel, ICampaignFieldOptionDomainFactory> repository)
        {
            _repository = repository;
        }

        public long OptionId { get; set; }
        public long FieldId { get; set; }
        public string OptionKey { get; set; }
        public string OptionValue { get; set; }

        public ICampaignFieldOptionModel Insert(ICampaignFieldOptionDomainFactory factory)
        {
            return _repository.Insert(this, factory);
        }

        public ICampaignFieldOptionModel Update(ICampaignFieldOptionDomainFactory factory)
        {
            return _repository.Update(this, factory);
        }

        public ICampaignFieldOptionModel GetById(long optionId, ICampaignFieldOptionDomainFactory factory)
        {
            return _repository.GetById(optionId, factory);
        }

        public IEnumerable<ICampaignFieldOptionModel> ListOptions(long fieldId, ICampaignFieldOptionDomainFactory factory)
        {
            return _repository.ListOptions(fieldId, factory);
        }

        public void Delete(long optionId, ICampaignFieldOptionDomainFactory factory)
        {
            _repository.Delete(optionId, factory);
        }
    }
}