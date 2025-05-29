using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;

namespace Viralt.Domain.Interfaces.Models
{
    public interface IClientModel
    {
        long ClientId { get; set; }
        long CampaignId { get; set; }
        DateTime CreatedAt { get; set; }
        string Token { get; set; }
        string Name { get; set; }
        string Email { get; set; }
        string Phone { get; set; }
        DateTime? Birthday { get; set; }
        int? Status { get; set; }

        IClientModel Insert(IClientDomainFactory factory);
        IClientModel Update(IClientDomainFactory factory);
        IClientModel GetById(long clientId, IClientDomainFactory factory);
        IEnumerable<IClientModel> ListClients(long campaignId, IClientDomainFactory factory);
        void Delete(long clientId, IClientDomainFactory factory);
    }
}