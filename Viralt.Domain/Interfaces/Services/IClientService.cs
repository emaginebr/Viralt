using System.Collections.Generic;
using Viralt.Domain.Interfaces.Models;

namespace Viralt.Domain.Interfaces.Services
{
    public interface IClientService
    {
        IClientModel Insert(IClientModel model);
        IClientModel Update(IClientModel model);
        IClientModel GetById(long clientId);
        IEnumerable<IClientModel> ListByCampaign(long campaignId);
        void Delete(long clientId);
    }
}