using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;

namespace Viralt.Domain.Interfaces.Models
{
    public interface ICampaignEntryModel
    {
        long EntryId { get; set; }
        long CampaignId { get; set; }
        int EntryType { get; set; }
        string Title { get; set; }
        int Entries { get; set; }
        bool Daily { get; set; }
        bool Mandatory { get; set; }
        string EntryLabel { get; set; }
        string EntryValue { get; set; }

        ICampaignEntryModel Insert(ICampaignEntryDomainFactory factory);
        ICampaignEntryModel Update(ICampaignEntryDomainFactory factory);
        ICampaignEntryModel GetById(long entryId, ICampaignEntryDomainFactory factory);
        IEnumerable<ICampaignEntryModel> ListEntries(long campaignId, ICampaignEntryDomainFactory factory);
        void Delete(long entryId, ICampaignEntryDomainFactory factory);
    }
}