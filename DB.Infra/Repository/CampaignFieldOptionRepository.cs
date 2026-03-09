using System;
using System.Collections.Generic;
using System.Linq;
using Core.Domain.Repository;
using DB.Infra.Context;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;

namespace DB.Infra.Repository
{
    public class CampaignFieldOptionRepository : ICampaignFieldOptionRepository<ICampaignFieldOptionModel, ICampaignFieldOptionDomainFactory>
    {
        private readonly ViraltContext _context;

        public CampaignFieldOptionRepository(ViraltContext context)
        {
            _context = context;
        }

        private ICampaignFieldOptionModel DbToModel(ICampaignFieldOptionDomainFactory factory, CampaignFieldOption entity)
        {
            var model = factory.BuildCampaignFieldOptionModel();
            model.OptionId = entity.OptionId;
            model.FieldId = entity.FieldId;
            model.OptionKey = entity.OptionKey;
            model.OptionValue = entity.OptionValue;
            return model;
        }

        private void ModelToDb(ICampaignFieldOptionModel model, CampaignFieldOption entity)
        {
            entity.OptionId = model.OptionId;
            entity.FieldId = model.FieldId;
            entity.OptionKey = model.OptionKey;
            entity.OptionValue = model.OptionValue;
        }

        public ICampaignFieldOptionModel Insert(ICampaignFieldOptionModel model, ICampaignFieldOptionDomainFactory factory)
        {
            var entity = new CampaignFieldOption();
            ModelToDb(model, entity);
            _context.CampaignFieldOptions.Add(entity);
            _context.SaveChanges();
            model.OptionId = entity.OptionId;
            return model;
        }

        public ICampaignFieldOptionModel Update(ICampaignFieldOptionModel model, ICampaignFieldOptionDomainFactory factory)
        {
            var entity = _context.CampaignFieldOptions.FirstOrDefault(x => x.OptionId == model.OptionId);
            if (entity == null)
                throw new Exception("Option not found");
            ModelToDb(model, entity);
            _context.CampaignFieldOptions.Update(entity);
            _context.SaveChanges();
            return model;
        }

        public IEnumerable<ICampaignFieldOptionModel> ListOptions(long fieldId, ICampaignFieldOptionDomainFactory factory)
        {
            var entities = _context.CampaignFieldOptions.Where(x => x.FieldId == fieldId).ToList();
            return entities.Select(x => DbToModel(factory, x));
        }

        public ICampaignFieldOptionModel GetById(long optionId, ICampaignFieldOptionDomainFactory factory)
        {
            var entity = _context.CampaignFieldOptions.Find(optionId);
            if (entity == null)
                return null;
            return DbToModel(factory, entity);
        }

        public void Delete(long optionId, ICampaignFieldOptionDomainFactory factory)
        {
            var entity = _context.CampaignFieldOptions.Find(optionId);
            if (entity == null)
                throw new Exception("Option not found");
            _context.CampaignFieldOptions.Remove(entity);
            _context.SaveChanges();
        }
    }
}