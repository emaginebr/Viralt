using System.Collections.Generic;
using System.Linq;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Interfaces.Services;
using Core.Domain.Repository;

namespace Viralt.Domain.Impl.Services
{
    public class CampaignService : ICampaignService
    {
        private readonly ICampaignRepository<ICampaignModel, ICampaignDomainFactory> _repository;
        private readonly ICampaignDomainFactory _factory;

        public CampaignService(
            ICampaignRepository<ICampaignModel, ICampaignDomainFactory> repository,
            ICampaignDomainFactory factory)
        {
            _repository = repository;
            _factory = factory;
        }

        public ICampaignModel Insert(ICampaignModel model)
        {
            return _repository.Insert(model, _factory);
        }

        public ICampaignModel Update(ICampaignModel model)
        {
            return _repository.Update(model, _factory);
        }

        public ICampaignModel GetById(long campaignId)
        {
            return _repository.GetById(campaignId, _factory);
        }

        public IEnumerable<ICampaignModel> ListCampaigns(int take)
        {
            return _repository.ListCampaigns(take, _factory);
        }

        public void Delete(long campaignId)
        {
            _repository.Delete(campaignId, _factory);
        }

        public IEnumerable<ICampaignModel> ListByUser(long userId)
        {
            // Considerando que não há método direto no repositório, faz o filtro em memória
            return _repository.ListCampaigns(int.MaxValue, _factory)
                .Where(c => c.UserId == userId);
        }
    }
}