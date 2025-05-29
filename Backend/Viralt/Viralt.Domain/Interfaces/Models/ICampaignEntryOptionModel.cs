using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;

namespace Viralt.Domain.Interfaces.Models
{
    public interface ICampaignEntryOptionModel
    {
        long OptionId { get; set; }
        long EntryId { get; set; }
        string OptionKey { get; set; }
        string OptionValue { get; set; }

        ICampaignEntryOptionModel Insert(ICampaignEntryOptionDomainFactory factory);
        ICampaignEntryOptionModel Update(ICampaignEntryOptionDomainFactory factory);
        ICampaignEntryOptionModel GetById(long optionId, ICampaignEntryOptionDomainFactory factory);
        IEnumerable<ICampaignEntryOptionModel> ListOptions(long entryId, ICampaignEntryOptionDomainFactory factory);
        void Delete(long optionId, ICampaignEntryOptionDomainFactory factory);
    }
}