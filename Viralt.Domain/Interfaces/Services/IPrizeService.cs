namespace Viralt.Domain.Interfaces.Services;

public interface IPrizeService
{
    Viralt.DTO.Campaign.PrizeInfo GetById(long prizeId);
    IEnumerable<Viralt.DTO.Campaign.PrizeInfo> ListByCampaign(long campaignId);
    Viralt.DTO.Campaign.PrizeInfo Insert(Viralt.DTO.Campaign.PrizeInsertInfo dto);
    Viralt.DTO.Campaign.PrizeInfo Update(Viralt.DTO.Campaign.PrizeUpdateInfo dto);
    void Delete(long prizeId);
}
