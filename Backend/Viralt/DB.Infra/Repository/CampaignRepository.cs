using System;
using System.Collections.Generic;
using System.Linq;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Core.Domain.Repository;
using DB.Infra.Context;

namespace DB.Infra.Repository
{
    public class CampaignRepository : ICampaignRepository<ICampaignModel, ICampaignDomainFactory>
    {
        private readonly ViraltContext _context;

        public CampaignRepository(ViraltContext context)
        {
            _context = context;
        }

        private ICampaignModel DbToModel(ICampaignDomainFactory factory, Campaign c)
        {
            var model = factory.BuildCampaignModel();
            model.CampaignId = c.CampaignId;
            model.UserId = c.UserId;
            model.Title = c.Title;
            model.Description = c.Description;
            model.StartTime = c.StartTime;
            model.EndTime = c.EndTime;
            model.Status = c.Status;
            model.NameRequired = c.NameRequired;
            model.EmailRequired = c.EmailRequired;
            model.PhoneRequired = c.PhoneRequired;
            model.MinAge = c.MinAge;
            model.BgImage = c.BgImage;
            model.TopImage = c.TopImage;
            model.YoutubeUrl = c.YoutubeUrl;
            model.CustomCss = c.CustomCss;
            model.MinEntry = c.MinEntry;
            return model;
        }

        private void ModelToDb(ICampaignModel model, Campaign row)
        {
            row.CampaignId = model.CampaignId;
            row.UserId = model.UserId;
            row.Title = model.Title;
            row.Description = model.Description;
            row.StartTime = model.StartTime;
            row.EndTime = model.EndTime;
            row.Status = model.Status;
            row.NameRequired = model.NameRequired;
            row.EmailRequired = model.EmailRequired;
            row.PhoneRequired = model.PhoneRequired;
            row.MinAge = model.MinAge;
            row.BgImage = model.BgImage;
            row.TopImage = model.TopImage;
            row.YoutubeUrl = model.YoutubeUrl;
            row.CustomCss = model.CustomCss;
            row.MinEntry = model.MinEntry;
        }

        public ICampaignModel Insert(ICampaignModel model, ICampaignDomainFactory factory)
        {
            var entity = new Campaign();
            ModelToDb(model, entity);
            _context.Campaigns.Add(entity);
            _context.SaveChanges();
            model.CampaignId = entity.CampaignId;
            return model;
        }

        public ICampaignModel Update(ICampaignModel model, ICampaignDomainFactory factory)
        {
            var entity = _context.Campaigns.FirstOrDefault(x => x.CampaignId == model.CampaignId);
            if (entity == null)
                throw new Exception("Campaign not found");
            ModelToDb(model, entity);
            _context.Campaigns.Update(entity);
            _context.SaveChanges();
            return model;
        }

        public IEnumerable<ICampaignModel> ListCampaigns(int take, ICampaignDomainFactory factory)
        {
            var entities = _context.Campaigns.OrderBy(x => x.Title).Take(take).ToList();
            return entities.Select(x => DbToModel(factory, x));
        }

        public ICampaignModel GetById(long campaignId, ICampaignDomainFactory factory)
        {
            var entity = _context.Campaigns.Find(campaignId);
            if (entity == null)
                return null;
            return DbToModel(factory, entity);
        }

        public void Delete(long campaignId, ICampaignDomainFactory factory)
        {
            var entity = _context.Campaigns.Find(campaignId);
            if (entity == null)
                throw new Exception("Campaign not found");
            _context.Campaigns.Remove(entity);
            _context.SaveChanges();
        }
    }
}