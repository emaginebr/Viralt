using HotChocolate.Data;
using HotChocolate.Types;
using Viralt.Domain.Models;
using Viralt.Infra.Context;

namespace Viralt.GraphQL.Public;

[ExtendObjectType("Query")]
public class PublicQuery
{
    [UseProjection]
    public IQueryable<Campaign> GetCampaign(ViraltContext context, string slug)
        => context.Campaigns.Where(c => c.Slug == slug && c.IsPublished);

    [UseOffsetPaging]
    [UseProjection]
    [UseSorting]
    public IQueryable<Client> GetLeaderboard(ViraltContext context, string slug)
        => context.Clients
            .Where(c => c.Campaign.Slug == slug && !c.IsDisqualified)
            .OrderByDescending(c => c.TotalEntries);

    [UseProjection]
    public IQueryable<ClientEntry> GetMyEntries(ViraltContext context, string token)
        => context.ClientEntries
            .Where(ce => ce.Client.Token == token);

    [UseProjection]
    public IQueryable<Winner> GetWinners(ViraltContext context, string slug)
        => context.Winners.Where(w => w.Campaign.Slug == slug).OrderByDescending(w => w.SelectedAt);

    public int GetReferralCount(ViraltContext context, string token)
        => context.Referrals.Count(r => r.ReferrerClient.Token == token);

    [UseProjection]
    public IQueryable<Referral> GetMyReferrals(ViraltContext context, string token)
        => context.Referrals.Where(r => r.ReferrerClient.Token == token).OrderByDescending(r => r.CreatedAt);

    [UseOffsetPaging]
    [UseProjection]
    public IQueryable<Submission> GetGallery(ViraltContext context, string slug)
        => context.Submissions.Where(s => s.Campaign.Slug == slug && s.Status == 1).OrderByDescending(s => s.VoteCount);
}
