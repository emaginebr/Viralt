using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Campaign;
using Viralt.DTO.MailerSend;
using Viralt.Infra.Interfaces.AppServices;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class WinnerService : IWinnerService
{
    private readonly IWinnerRepository<Winner> _winnerRepository;
    private readonly IClientRepository<Client> _clientRepository;
    private readonly ICampaignRepository<Campaign> _campaignRepository;
    private readonly IPrizeRepository<Prize> _prizeRepository;
    private readonly IMailerSendAppService _mailerSendAppService;

    public WinnerService(
        IWinnerRepository<Winner> winnerRepository,
        IClientRepository<Client> clientRepository,
        ICampaignRepository<Campaign> campaignRepository,
        IPrizeRepository<Prize> prizeRepository,
        IMailerSendAppService mailerSendAppService)
    {
        _winnerRepository = winnerRepository;
        _clientRepository = clientRepository;
        _campaignRepository = campaignRepository;
        _prizeRepository = prizeRepository;
        _mailerSendAppService = mailerSendAppService;
    }

    public IEnumerable<WinnerInfo> DrawWinners(long campaignId, int winnerCount, int selectionMethod)
    {
        var clients = _clientRepository.ListClients(campaignId)
            .Where(c => !c.IsDisqualified && !c.IsWinner)
            .ToList();

        if (clients.Count == 0)
            return Enumerable.Empty<WinnerInfo>();

        List<Client> selectedClients;

        switch (selectionMethod)
        {
            case 1: // Random weighted
                selectedClients = DrawWeightedRandom(clients, winnerCount);
                break;
            case 2: // Leaderboard
                selectedClients = clients
                    .OrderByDescending(c => c.TotalEntries)
                    .ThenBy(c => c.CreatedAt)
                    .Take(winnerCount)
                    .ToList();
                break;
            case 3: // Manual
                return Enumerable.Empty<WinnerInfo>();
            default:
                throw new ArgumentException($"Invalid selection method: {selectionMethod}");
        }

        var winners = new List<WinnerInfo>();

        foreach (var client in selectedClients)
        {
            var winner = new Winner
            {
                CampaignId = campaignId,
                ClientId = client.ClientId,
                SelectedAt = DateTime.UtcNow,
                SelectionMethod = selectionMethod,
                Notified = false,
                Claimed = false
            };

            var saved = _winnerRepository.Insert(winner);

            client.IsWinner = true;
            _clientRepository.Update(client);

            winners.Add(MapToDto(saved));
        }

        return winners;
    }

    public IEnumerable<WinnerInfo> ListByCampaign(long campaignId)
    {
        return _winnerRepository.ListByCampaign(campaignId).Select(MapToDto);
    }

    public void NotifyWinner(long winnerId)
    {
        var winner = _winnerRepository.GetById(winnerId)
            ?? throw new KeyNotFoundException($"Winner {winnerId} not found.");

        var client = _clientRepository.GetById(winner.ClientId)
            ?? throw new KeyNotFoundException($"Client {winner.ClientId} not found.");

        if (string.IsNullOrWhiteSpace(client.Email))
            throw new InvalidOperationException($"Client {client.ClientId} has no email address.");

        var campaign = _campaignRepository.GetById(winner.CampaignId)
            ?? throw new KeyNotFoundException($"Campaign {winner.CampaignId} not found.");

        var email = new MailerInfo
        {
            From = new MailerRecipientInfo { Email = "noreply@viralt.com", Name = "Viralt" },
            To = new List<MailerRecipientInfo>
            {
                new MailerRecipientInfo { Email = client.Email, Name = client.Name ?? client.Email }
            },
            Subject = $"Congratulations! You won in {campaign.Title}",
            Html = $"<p>Hi {client.Name ?? "there"},</p>" +
                   $"<p>Congratulations! You have been selected as a winner in <strong>{campaign.Title}</strong>.</p>" +
                   $"<p>Please check the campaign page for more details on how to claim your prize.</p>"
        };

        _mailerSendAppService.SendMail(email).GetAwaiter().GetResult();

        winner.Notified = true;
        _winnerRepository.Update(winner);
    }

    public void NotifyAll(long campaignId)
    {
        var winners = _winnerRepository.ListByCampaign(campaignId)
            .Where(w => !w.Notified)
            .ToList();

        foreach (var winner in winners)
        {
            NotifyWinner(winner.WinnerId);
        }
    }

    private static List<Client> DrawWeightedRandom(List<Client> clients, int count)
    {
        var random = new Random();
        var selected = new List<Client>();
        var remaining = new List<Client>(clients);

        var actualCount = Math.Min(count, remaining.Count);

        for (int i = 0; i < actualCount; i++)
        {
            var totalWeight = remaining.Sum(c => Math.Max(c.TotalEntries, 1));
            var roll = random.Next(0, totalWeight);
            var cumulative = 0;

            for (int j = 0; j < remaining.Count; j++)
            {
                cumulative += Math.Max(remaining[j].TotalEntries, 1);
                if (roll < cumulative)
                {
                    selected.Add(remaining[j]);
                    remaining.RemoveAt(j);
                    break;
                }
            }
        }

        return selected;
    }

    private static WinnerInfo MapToDto(Winner model)
    {
        if (model == null) return null;
        return new WinnerInfo
        {
            WinnerId = model.WinnerId,
            CampaignId = model.CampaignId,
            ClientId = model.ClientId,
            PrizeId = model.PrizeId,
            SelectedAt = model.SelectedAt,
            SelectionMethod = model.SelectionMethod.ToString(),
            Notified = model.Notified,
            Claimed = model.Claimed,
            ClaimData = model.ClaimData
        };
    }
}
