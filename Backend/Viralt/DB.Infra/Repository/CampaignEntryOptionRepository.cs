using System;
using System.Collections.Generic;
using System.Linq;
using Core.Domain.Repository;
using DB.Infra.Context;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;

namespace DB.Infra.Repository
{
    public class CampaignEntryOptionRepository : ICampaignEntryOptionRepository<ICampaignEntryOptionModel, ICampaignEntryOptionDomainFactory>
    {
        private readonly ViraltContext _context;

        public CampaignEntryOptionRepository(ViraltContext context)
        {
            _context = context;
        }

        private ICampaignEntryOptionModel DbToModel(ICampaignEntryOptionDomainFactory factory, CampaignEntryOption entity)
        {
            var model = factory.BuildCampaignEntryOptionModel();
            model.OptionId = entity.OptionId;
            model.EntryId = entity.EntryId;
            model.OptionKey = entity.OptionKey;
            model.OptionValue = entity.OptionValue;
            return model;
        }

        private void ModelToDb(ICampaignEntryOptionModel model, CampaignEntryOption entity)
        {
            entity.OptionId = model.OptionId;
            entity.EntryId = model.EntryId;
            entity.OptionKey = model.OptionKey;
            entity.OptionValue = model.OptionValue;
        }

        public ICampaignEntryOptionModel Insert(ICampaignEntryOptionModel model, ICampaignEntryOptionDomainFactory factory)
        {
            var entity = new CampaignEntryOption();
            ModelToDb(model, entity);
            _context.CampaignEntryOptions.Add(entity);
            _context.SaveChanges();
            model.OptionId = entity.OptionId;
            return model;
        }

        public ICampaignEntryOptionModel Update(ICampaignEntryOptionModel model, ICampaignEntryOptionDomainFactory factory)
        {
            var entity = _context.CampaignEntryOptions.FirstOrDefault(x => x.OptionId == model.OptionId);
            if (entity == null)
                throw new Exception("Option not found");
            ModelToDb(model, entity);
            _context.CampaignEntryOptions.Update(entity);
            _context.SaveChanges();
            return model;
        }

        public IEnumerable<ICampaignEntryOptionModel> ListOptions(long entryId, ICampaignEntryOptionDomainFactory factory)
        {
            var entities = _context.CampaignEntryOptions.Where(x => x.EntryId == entryId).ToList();
            return entities.Select(x => DbToModel(factory, x));
        }

        public ICampaignEntryOptionModel GetById(long optionId, ICampaignEntryOptionDomainFactory factory)
        {
            var entity = _context.CampaignEntryOptions.Find(optionId);
            if (entity == null)
                return null;
            return DbToModel(factory, entity);
        }

        public void Delete(long optionId, ICampaignEntryOptionDomainFactory factory)
        {
            var entity = _context.CampaignEntryOptions.Find(optionId);
            if (entity == null)
                throw new Exception("Option not found");
            _context.CampaignEntryOptions.Remove(entity);
            _context.SaveChanges();
        }
    }
}