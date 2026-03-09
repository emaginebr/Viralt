using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Client;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository<Client> _repository;

    public ClientService(IClientRepository<Client> repository)
    {
        _repository = repository;
    }

    public ClientInfo Insert(ClientInfo dto)
    {
        var model = MapToModel(dto);
        model.CreatedAt = DateTime.Now;
        var saved = _repository.Insert(model);
        return MapToDto(saved);
    }

    public ClientInfo Update(ClientInfo dto)
    {
        var model = MapToModel(dto);
        var updated = _repository.Update(model);
        return MapToDto(updated);
    }

    public ClientInfo GetById(long clientId)
    {
        var model = _repository.GetById(clientId);
        return MapToDto(model);
    }

    public List<ClientInfo> ListByCampaign(long campaignId)
    {
        return _repository.ListClients(campaignId).Select(MapToDto).ToList();
    }

    public void Delete(long clientId)
    {
        _repository.Delete(clientId);
    }

    private static ClientInfo MapToDto(Client model)
    {
        if (model == null) return null;
        return new ClientInfo
        {
            ClientId = model.ClientId,
            CampaignId = model.CampaignId,
            CreatedAt = model.CreatedAt,
            Token = model.Token,
            Name = model.Name,
            Email = model.Email,
            Phone = model.Phone,
            Birthday = model.Birthday,
            Status = model.Status
        };
    }

    private static Client MapToModel(ClientInfo dto) => new()
    {
        ClientId = dto.ClientId,
        CampaignId = dto.CampaignId,
        CreatedAt = dto.CreatedAt,
        Token = dto.Token,
        Name = dto.Name,
        Email = dto.Email,
        Phone = dto.Phone,
        Birthday = dto.Birthday,
        Status = dto.Status
    };
}
