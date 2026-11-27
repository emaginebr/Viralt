using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;

namespace Viralt.Domain.Interfaces.Models
{
    public interface ICampaignModel
    {
        long CampaignId { get; set; }
        long UserId { get; set; }
        string Title { get; set; }
        string Description { get; set; }
        DateTime? StartTime { get; set; }
        DateTime? EndTime { get; set; }
        int Status { get; set; }
        bool NameRequired { get; set; }
        bool EmailRequired { get; set; }
        bool PhoneRequired { get; set; }
        int? MinAge { get; set; }
        string BgImage { get; set; }
        string TopImage { get; set; }
        string YoutubeUrl { get; set; }
        string CustomCss { get; set; }
        int? MinEntry { get; set; }

        ICampaignModel Insert(ICampaignDomainFactory factory);
        ICampaignModel Update(ICampaignDomainFactory factory);
        ICampaignModel GetById(long campaignId, ICampaignDomainFactory factory);
        IEnumerable<ICampaignModel> ListCampaigns(int take, ICampaignDomainFactory factory);
        void Delete(long campaignId, ICampaignDomainFactory factory);
    }
}