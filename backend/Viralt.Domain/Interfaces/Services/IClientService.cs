using Viralt.DTO.Client;

namespace Viralt.Domain.Interfaces.Services;

public interface IClientService
{
    ClientInfo Insert(ClientInfo client);
    ClientInfo Update(ClientInfo client);
    ClientInfo GetById(long clientId);
    ClientInfo GetByToken(string token);
    ClientInfo GetByEmail(long campaignId, string email);
    List<ClientInfo> ListByCampaign(long campaignId);
    void Delete(long clientId);
}
