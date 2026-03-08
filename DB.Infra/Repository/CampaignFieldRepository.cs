using System;
using System.Collections.Generic;
using System.Linq;
using Core.Domain.Repository;
using DB.Infra.Context;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;

namespace DB.Infra.Repository
{
    public class CampaignFieldRepository : ICampaignFieldRepository<ICampaignFieldModel, ICampaignFieldDomainFactory>
    {
        private readonly ViraltContext _context;

        public CampaignFieldRepository(ViraltContext context)
        {
            _context = context;
        }

        private ICampaignFieldModel DbToModel(ICampaignFieldDomainFactory factory, CampaignField entity)
        {
            var model = factory.BuildCampaignFieldModel();
            model.FieldId = entity.FieldId;
            model.CampaignId = entity.CampaignId;
            model.FieldType = entity.FieldType;
            model.Title = entity.Title;
            model.Required = entity.Required;
            return model;
        }

        private void ModelToDb(ICampaignFieldModel model, CampaignField entity)
        {
            entity.FieldId = model.FieldId;
            entity.CampaignId = model.CampaignId;
            entity.FieldType = model.FieldType;
            entity.Title = model.Title;
            entity.Required = model.Required;
        }

        public ICampaignFieldModel Insert(ICampaignFieldModel model, ICampaignFieldDomainFactory factory)
        {
            var entity = new CampaignField();
            ModelToDb(model, entity);
            _context.CampaignFields.Add(entity);
            _context.SaveChanges();
            model.FieldId = entity.FieldId;
            return model;
        }

        public ICampaignFieldModel Update(ICampaignFieldModel model, ICampaignFieldDomainFactory factory)
        {
            var entity = _context.CampaignFields.FirstOrDefault(x => x.FieldId == model.FieldId);
            if (entity == null)
                throw new Exception("Field not found");
            ModelToDb(model, entity);
            _context.CampaignFields.Update(entity);
            _context.SaveChanges();
            return model;
        }

        public IEnumerable<ICampaignFieldModel> ListFields(long campaignId, ICampaignFieldDomainFactory factory)
        {
            var entities = _context.CampaignFields.Where(x => x.CampaignId == campaignId).ToList();
            return entities.Select(x => DbToModel(factory, x));
        }

        public ICampaignFieldModel GetById(long fieldId, ICampaignFieldDomainFactory factory)
        {
            var entity = _context.CampaignFields.Find(fieldId);
            if (entity == null)
                return null;
            return DbToModel(factory, entity);
        }

        public void Delete(long fieldId, ICampaignFieldDomainFactory factory)
        {
            var entity = _context.CampaignFields.Find(fieldId);
            if (entity == null)
                throw new Exception("Field not found");
            _context.CampaignFields.Remove(entity);
            _context.SaveChanges();
        }
    }
}