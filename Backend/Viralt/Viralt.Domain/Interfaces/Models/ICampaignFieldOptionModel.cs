using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;

namespace Viralt.Domain.Interfaces.Models
{
    public interface ICampaignFieldOptionModel
    {
        long OptionId { get; set; }
        long FieldId { get; set; }
        string OptionKey { get; set; }
        string OptionValue { get; set; }

        ICampaignFieldOptionModel Insert(ICampaignFieldOptionDomainFactory factory);
        ICampaignFieldOptionModel Update(ICampaignFieldOptionDomainFactory factory);
        ICampaignFieldOptionModel GetById(long optionId, ICampaignFieldOptionDomainFactory factory);
        IEnumerable<ICampaignFieldOptionModel> ListOptions(long fieldId, ICampaignFieldOptionDomainFactory factory);
        void Delete(long optionId, ICampaignFieldOptionDomainFactory factory);
    }
}