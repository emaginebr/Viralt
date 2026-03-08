using System;
using System.Collections.Generic;
using System.Linq;
using Core.Domain.Repository;
using DB.Infra.Context;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;

namespace DB.Infra.Repository
{
    public class ClientEntryRepository : IClientEntryRepository<IClientEntryModel, IClientEntryDomainFactory>
    {
        private readonly ViraltContext _context;

        public ClientEntryRepository(ViraltContext context)
        {
            _context = context;
        }

        private IClientEntryModel DbToModel(IClientEntryDomainFactory factory, ClientEntry entity)
        {
            var model = factory.BuildClientEntryModel();
            model.ClientEntryId = entity.ClientEntryId;
            model.ClientId = entity.ClientId;
            model.EntryId = entity.EntryId;
            model.Status = entity.Status;
            model.EntryValue = entity.EntryValue;
            return model;
        }

        private void ModelToDb(IClientEntryModel model, ClientEntry entity)
        {
            entity.ClientEntryId = model.ClientEntryId;
            entity.ClientId = model.ClientId;
            entity.EntryId = model.EntryId;
            entity.Status = model.Status;
            entity.EntryValue = model.EntryValue;
        }

        public IClientEntryModel Insert(IClientEntryModel model, IClientEntryDomainFactory factory)
        {
            var entity = new ClientEntry();
            ModelToDb(model, entity);
            _context.ClientEntries.Add(entity);
            _context.SaveChanges();
            model.ClientEntryId = entity.ClientEntryId;
            return model;
        }

        public IClientEntryModel Update(IClientEntryModel model, IClientEntryDomainFactory factory)
        {
            var entity = _context.ClientEntries.FirstOrDefault(x => x.ClientEntryId == model.ClientEntryId);
            if (entity == null)
                throw new Exception("ClientEntry not found");
            ModelToDb(model, entity);
            _context.ClientEntries.Update(entity);
            _context.SaveChanges();
            return model;
        }

        public IEnumerable<IClientEntryModel> ListByClient(long clientId, IClientEntryDomainFactory factory)
        {
            var entities = _context.ClientEntries.Where(x => x.ClientId == clientId).ToList();
            return entities.Select(x => DbToModel(factory, x));
        }

        public IClientEntryModel GetById(long clientEntryId, IClientEntryDomainFactory factory)
        {
            var entity = _context.ClientEntries.Find(clientEntryId);
            if (entity == null)
                return null;
            return DbToModel(factory, entity);
        }

        public void Delete(long clientEntryId, IClientEntryDomainFactory factory)
        {
            var entity = _context.ClientEntries.Find(clientEntryId);
            if (entity == null)
                throw new Exception("ClientEntry not found");
            _context.ClientEntries.Remove(entity);
            _context.SaveChanges();
        }
    }
}