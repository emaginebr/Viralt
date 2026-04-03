namespace Viralt.GraphQL.Admin.Types;

public class CampaignAnalytics
{
    public int TotalParticipants { get; set; }
    public int TotalEntries { get; set; }
    public int TotalViews { get; set; }
    public double ConversionRate { get; set; }
    public int ReferralCount { get; set; }
}

public class DashboardAnalytics
{
    public int ActiveCampaigns { get; set; }
    public int TotalParticipantsAll { get; set; }
    public int TotalEntriesAll { get; set; }
}
