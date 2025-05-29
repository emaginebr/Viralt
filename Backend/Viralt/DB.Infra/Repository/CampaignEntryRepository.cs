using System;
using System.Collections.Generic;
using System.Linq;
using Core.Domain.Repository;
using DB.Infra.Context;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;

namespace DB.Infra.Repository
{
    public class CampaignEntryRepository : ICampaignEntryRepository<ICampaignEntryModel, ICampaignEntryDomainFactory>
    {
        private readonly ViraltContext _context;

        public CampaignEntryRepository(ViraltContext context)
        {
            _context = context;
        }

        private ICampaignEntryModel DbToModel(ICampaignEntryDomainFactory factory, CampaignEntry entity)
        {
            var model = factory.BuildCampaignEntryModel();
            model.EntryId = entity.EntryId;
            model.CampaignId = entity.CampaignId;
            model.EntryType = entity.EntryType;
            model.Title = entity.Title;
            model.Entries = entity.Entries;
            model.Daily = entity.Daily;
            model.Mandatory = entity.Mandatory;
            model.EntryLabel = entity.EntryLabel;
            model.EntryValue = entity.EntryValue;
            return model;
        }

        private void ModelToDb(ICampaignEntryModel model, CampaignEntry entity)
        {
            entity.EntryId = model.EntryId;
            entity.CampaignId = model.CampaignId;
            entity.EntryType = model.EntryType;
            entity.Title = model.Title;
            entity.Entries = model.Entries;
            entity.Daily = model.Daily;
            entity.Mandatory = model.Mandatory;
            entity.EntryLabel = model.EntryLabel;
            entity.EntryValue = model.EntryValue;
        }

        public ICampaignEntryModel Insert(ICampaignEntryModel model, ICampaignEntryDomainFactory factory)
        {
            var entity = new CampaignEntry();
            ModelToDb(model, entity);
            _context.CampaignEntries.Add(entity);
            _context.SaveChanges();
            model.EntryId = entity.EntryId;
            return model;
        }

        public ICampaignEntryModel Update(ICampaignEntryModel model, ICampaignEntryDomainFactory factory)
        {
            var entity = _context.CampaignEntries.FirstOrDefault(x => x.EntryId == model.EntryId);
            if (entity == null)
                throw new Exception("Entry not found");
            ModelToDb(model, entity);
            _context.CampaignEntries.Update(entity);
            _context.SaveChanges();
            return model;
        }

        public IEnumerable<ICampaignEntryModel> ListEntries(long campaignId, ICampaignEntryDomainFactory factory)
        {
            var entities = _context.CampaignEntries.Where(x => x.CampaignId == campaignId).ToList();
            return entities.Select(x => DbToModel(factory, x));
        }

        public ICampaignEntryModel GetById(long entryId, ICampaignEntryDomainFactory factory)
        {
            var entity = _context.CampaignEntries.Find(entryId);
            if (entity == null)
                return null;
            return DbToModel(factory, entity);
        }

        public void Delete(long entryId, ICampaignEntryDomainFactory factory)
        {
            var entity = _context.CampaignEntries.Find(entryId);
            if (entity == null)
                throw new Exception("Entry not found");
            _context.CampaignEntries.Remove(entity);
            _context.SaveChanges();
        }
    }
}