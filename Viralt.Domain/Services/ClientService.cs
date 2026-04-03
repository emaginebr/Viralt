using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Client;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository<Client> _repository;
    private static readonly Random _random = new();
    private const string AlphanumericChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    public ClientService(IClientRepository<Client> repository)
    {
        _repository = repository;
    }

    public ClientInfo Insert(ClientInfo dto)
    {
        var model = MapToModel(dto);
        model.CreatedAt = DateTime.Now;
        model.TotalEntries = 0;
        model.ReferralToken = GenerateReferralToken();
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

    public ClientInfo GetByToken(string token)
    {
        var model = _repository.GetByToken(token);
        return MapToDto(model);
    }

    public ClientInfo GetByEmail(long campaignId, string email)
    {
        var model = _repository.GetByEmail(campaignId, email);
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

    private static string GenerateReferralToken()
    {
        var chars = new char[8];
        lock (_random)
        {
            for (int i = 0; i < 8; i++)
                chars[i] = AlphanumericChars[_random.Next(AlphanumericChars.Length)];
        }
        return new string(chars);
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
            Status = model.Status,
            ReferralToken = model.ReferralToken,
            ReferredByClientId = model.ReferredByClientId,
            IpAddress = model.IpAddress,
            CountryCode = model.CountryCode,
            UserAgent = model.UserAgent,
            TotalEntries = model.TotalEntries,
            EmailVerified = model.EmailVerified,
            IsWinner = model.IsWinner,
            IsDisqualified = model.IsDisqualified
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
        Status = dto.Status,
        ReferralToken = dto.ReferralToken,
        ReferredByClientId = dto.ReferredByClientId,
        IpAddress = dto.IpAddress,
        CountryCode = dto.CountryCode,
        UserAgent = dto.UserAgent,
        TotalEntries = dto.TotalEntries,
        EmailVerified = dto.EmailVerified,
        IsWinner = dto.IsWinner,
        IsDisqualified = dto.IsDisqualified
    };
}
