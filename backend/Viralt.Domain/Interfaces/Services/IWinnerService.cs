namespace Viralt.Domain.Interfaces.Services;

public interface IWinnerService
{
    IEnumerable<Viralt.DTO.Campaign.WinnerInfo> DrawWinners(long campaignId, int winnerCount, int selectionMethod);
    IEnumerable<Viralt.DTO.Campaign.WinnerInfo> ListByCampaign(long campaignId);
    void NotifyWinner(long winnerId);
    Viralt.DTO.Campaign.NotifyAllResult NotifyAll(long campaignId);
}
