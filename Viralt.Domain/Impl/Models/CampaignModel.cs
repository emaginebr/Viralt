using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Core.Domain.Repository;

namespace Viralt.Domain.Impl.Models
{
    public class CampaignModel : ICampaignModel
    {
        private readonly ICampaignRepository<ICampaignModel, ICampaignDomainFactory> _repositoryCampaign;

        public CampaignModel(ICampaignRepository<ICampaignModel, ICampaignDomainFactory> repositoryCampaign)
        {
            _repositoryCampaign = repositoryCampaign;
        }

        public long CampaignId { get; set; }
        public long UserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int Status { get; set; }
        public bool NameRequired { get; set; }
        public bool EmailRequired { get; set; }
        public bool PhoneRequired { get; set; }
        public int? MinAge { get; set; }
        public string BgImage { get; set; }
        public string TopImage { get; set; }
        public string YoutubeUrl { get; set; }
        public string CustomCss { get; set; }
        public int? MinEntry { get; set; }

        public ICampaignModel Insert(ICampaignDomainFactory factory)
        {
            return _repositoryCampaign.Insert(this, factory);
        }

        public ICampaignModel Update(ICampaignDomainFactory factory)
        {
            return _repositoryCampaign.Update(this, factory);
        }

        public ICampaignModel GetById(long campaignId, ICampaignDomainFactory factory)
        {
            return _repositoryCampaign.GetById(campaignId, factory);
        }

        public IEnumerable<ICampaignModel> ListCampaigns(int take, ICampaignDomainFactory factory)
        {
            return _repositoryCampaign.ListCampaigns(take, factory);
        }

        public void Delete(long campaignId, ICampaignDomainFactory factory)
        {
            _repositoryCampaign.Delete(campaignId, factory);
        }
    }
}