using System;
using System.Collections.Generic;
using System.Linq;
using Core.Domain.Repository;
using DB.Infra.Context;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;

namespace DB.Infra.Repository
{
    public class ClientRepository : IClientRepository<IClientModel, IClientDomainFactory>
    {
        private readonly ViraltContext _context;

        public ClientRepository(ViraltContext context)
        {
            _context = context;
        }

        private IClientModel DbToModel(IClientDomainFactory factory, Client entity)
        {
            var model = factory.BuildClientModel();
            model.ClientId = entity.ClientId;
            model.CampaignId = entity.CampaignId;
            model.CreatedAt = entity.CreatedAt;
            model.Token = entity.Token;
            model.Name = entity.Name;
            model.Email = entity.Email;
            model.Phone = entity.Phone;
            model.Birthday = entity.Birthday;
            model.Status = entity.Status;
            return model;
        }

        private void ModelToDb(IClientModel model, Client entity)
        {
            entity.ClientId = model.ClientId;
            entity.CampaignId = model.CampaignId;
            entity.CreatedAt = model.CreatedAt;
            entity.Token = model.Token;
            entity.Name = model.Name;
            entity.Email = model.Email;
            entity.Phone = model.Phone;
            entity.Birthday = model.Birthday;
            entity.Status = model.Status;
        }

        public IClientModel Insert(IClientModel model, IClientDomainFactory factory)
        {
            var entity = new Client();
            ModelToDb(model, entity);
            _context.Clients.Add(entity);
            _context.SaveChanges();
            model.ClientId = entity.ClientId;
            return model;
        }

        public IClientModel Update(IClientModel model, IClientDomainFactory factory)
        {
            var entity = _context.Clients.FirstOrDefault(x => x.ClientId == model.ClientId);
            if (entity == null)
                throw new Exception("Client not found");
            ModelToDb(model, entity);
            _context.Clients.Update(entity);
            _context.SaveChanges();
            return model;
        }

        public IEnumerable<IClientModel> ListClients(long campaignId, IClientDomainFactory factory)
        {
            var entities = _context.Clients.Where(x => x.CampaignId == campaignId).ToList();
            return entities.Select(x => DbToModel(factory, x));
        }

        public IClientModel GetById(long clientId, IClientDomainFactory factory)
        {
            var entity = _context.Clients.Find(clientId);
            if (entity == null)
                return null;
            return DbToModel(factory, entity);
        }

        public void Delete(long clientId, IClientDomainFactory factory)
        {
            var entity = _context.Clients.Find(clientId);
            if (entity == null)
                throw new Exception("Client not found");
            _context.Clients.Remove(entity);
            _context.SaveChanges();
        }
    }
}