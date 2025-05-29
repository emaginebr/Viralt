using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;

namespace Viralt.Domain.Interfaces.Models
{
    public interface ICampaignFieldModel
    {
        long FieldId { get; set; }
        long CampaignId { get; set; }
        int FieldType { get; set; }
        string Title { get; set; }
        bool Required { get; set; }

        ICampaignFieldModel Insert(ICampaignFieldDomainFactory factory);
        ICampaignFieldModel Update(ICampaignFieldDomainFactory factory);
        ICampaignFieldModel GetById(long fieldId, ICampaignFieldDomainFactory factory);
        IEnumerable<ICampaignFieldModel> ListFields(long campaignId, ICampaignFieldDomainFactory factory);
        void Delete(long fieldId, ICampaignFieldDomainFactory factory);
    }
}