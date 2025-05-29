using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Core.Domain.Repository;

namespace Viralt.Domain.Impl.Models
{
    public class CampaignFieldModel : ICampaignFieldModel
    {
        private readonly ICampaignFieldRepository<ICampaignFieldModel, ICampaignFieldDomainFactory> _repository;

        public CampaignFieldModel(ICampaignFieldRepository<ICampaignFieldModel, ICampaignFieldDomainFactory> repository)
        {
            _repository = repository;
        }

        public long FieldId { get; set; }
        public long CampaignId { get; set; }
        public int FieldType { get; set; }
        public string Title { get; set; }
        public bool Required { get; set; }

        public ICampaignFieldModel Insert(ICampaignFieldDomainFactory factory)
        {
            return _repository.Insert(this, factory);
        }

        public ICampaignFieldModel Update(ICampaignFieldDomainFactory factory)
        {
            return _repository.Update(this, factory);
        }

        public ICampaignFieldModel GetById(long fieldId, ICampaignFieldDomainFactory factory)
        {
            return _repository.GetById(fieldId, factory);
        }

        public IEnumerable<ICampaignFieldModel> ListFields(long campaignId, ICampaignFieldDomainFactory factory)
        {
            return _repository.ListFields(campaignId, factory);
        }

        public void Delete(long fieldId, ICampaignFieldDomainFactory factory)
        {
            _repository.Delete(fieldId, factory);
        }
    }
}