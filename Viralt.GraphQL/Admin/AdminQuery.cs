using HotChocolate.Authorization;
using HotChocolate.Data;
using HotChocolate.Types;
using Viralt.Domain.Models;
using Viralt.GraphQL.Admin.Types;
using Viralt.Infra.Context;

namespace Viralt.GraphQL.Admin;

[ExtendObjectType("Query")]
public class AdminQuery
{
    [Authorize]
    [UseOffsetPaging]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Campaign> GetCampaigns(ViraltContext context)
        => context.Campaigns.OrderByDescending(c => c.CampaignId);

    [Authorize]
    [UseProjection]
    public IQueryable<Campaign> GetCampaignById(ViraltContext context, long id)
        => context.Campaigns.Where(c => c.CampaignId == id);

    [Authorize]
    [UseProjection]
    public IQueryable<Campaign> GetCampaignBySlug(ViraltContext context, string slug)
        => context.Campaigns.Where(c => c.Slug == slug);

    [Authorize]
    [UseProjection]
    public IQueryable<Prize> GetPrizesByCampaign(ViraltContext context, long campaignId)
        => context.Prizes.Where(p => p.CampaignId == campaignId).OrderBy(p => p.SortOrder);

    [Authorize]
    [UseProjection]
    public IQueryable<Winner> GetWinnersByCampaign(ViraltContext context, long campaignId)
        => context.Winners.Where(w => w.CampaignId == campaignId).OrderByDescending(w => w.SelectedAt);

    [Authorize]
    [UseOffsetPaging]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Client> GetClientsByCampaign(ViraltContext context, long campaignId)
        => context.Clients.Where(c => c.CampaignId == campaignId).OrderByDescending(c => c.CreatedAt);

    [Authorize]
    [UseProjection]
    public IQueryable<Client> GetClientById(ViraltContext context, long id)
        => context.Clients.Where(c => c.ClientId == id);

    [Authorize]
    public CampaignAnalytics GetCampaignAnalytics(ViraltContext context, long campaignId)
    {
        var campaign = context.Campaigns.FirstOrDefault(c => c.CampaignId == campaignId);
        if (campaign == null) return new CampaignAnalytics();

        var clients = context.Clients.Where(c => c.CampaignId == campaignId);
        var entries = context.ClientEntries.Where(ce => ce.Client.CampaignId == campaignId);

        return new CampaignAnalytics
        {
            TotalParticipants = (int)campaign.TotalParticipants,
            TotalEntries = (int)campaign.TotalEntries,
            TotalViews = (int)campaign.ViewCount,
            ConversionRate = campaign.ViewCount > 0
                ? Math.Round((double)campaign.TotalParticipants / campaign.ViewCount * 100, 2)
                : 0,
            ReferralCount = context.Referrals.Count(r => r.CampaignId == campaignId)
        };
    }

    [Authorize]
    public DashboardAnalytics GetDashboardAnalytics(ViraltContext context)
    {
        return new DashboardAnalytics
        {
            ActiveCampaigns = context.Campaigns.Count(c => c.Status == 2),
            TotalParticipantsAll = (int)context.Clients.LongCount(),
            TotalEntriesAll = (int)context.ClientEntries.LongCount()
        };
    }
}
