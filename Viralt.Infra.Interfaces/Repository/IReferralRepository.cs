namespace Viralt.Infra.Interfaces.Repository;

public interface IReferralRepository<TModel> where TModel : class
{
    TModel GetById(long referralId);
    IEnumerable<TModel> ListByCampaign(long campaignId);
    IEnumerable<TModel> ListByReferrer(long referrerClientId);
    TModel Insert(TModel model);
}
