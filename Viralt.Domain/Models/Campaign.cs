namespace Viralt.Domain.Models;

public class Campaign
{
    public long CampaignId { get; set; }
    public long UserId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int Status { get; set; }
    public bool NameRequired { get; set; }
    public bool EmailRequired { get; set; }
    public bool PhoneRequired { get; set; }
    public int? MinAge { get; set; }
    public string BgImage { get; set; }
    public string TopImage { get; set; }
    public string YoutubeUrl { get; set; }
    public string CustomCss { get; set; }
    public int? MinEntry { get; set; }
    public string Slug { get; set; }
    public string Timezone { get; set; }
    public int? MaxEntriesPerUser { get; set; }
    public int WinnerCount { get; set; }
    public bool IsPublished { get; set; }
    public string Password { get; set; }
    public string ThemePrimaryColor { get; set; }
    public string ThemeSecondaryColor { get; set; }
    public string ThemeBgColor { get; set; }
    public string ThemeFont { get; set; }
    public string LogoImage { get; set; }
    public string TermsUrl { get; set; }
    public string RedirectUrl { get; set; }
    public bool WelcomeEmailEnabled { get; set; }
    public string WelcomeEmailSubject { get; set; }
    public string WelcomeEmailBody { get; set; }
    public string GeoCountries { get; set; }
    public bool BlockVpn { get; set; }
    public bool RequireEmailVerification { get; set; }
    public int EntryType { get; set; }
    public long TotalEntries { get; set; }
    public long TotalParticipants { get; set; }
    public long ViewCount { get; set; }
    public string GaTrackingId { get; set; }
    public string FbPixelId { get; set; }
    public string TiktokPixelId { get; set; }
    public string GtmId { get; set; }
    public long? BrandId { get; set; }
    public string Language { get; set; }

    public virtual Brand Brand { get; set; }
    public virtual ICollection<CampaignEntry> CampaignEntries { get; set; } = new List<CampaignEntry>();
    public virtual ICollection<CampaignField> CampaignFields { get; set; } = new List<CampaignField>();
    public virtual ICollection<Client> Clients { get; set; } = new List<Client>();
    public virtual ICollection<Prize> Prizes { get; set; } = new List<Prize>();
    public virtual ICollection<Winner> Winners { get; set; } = new List<Winner>();
    public virtual ICollection<CampaignView> CampaignViews { get; set; } = new List<CampaignView>();
    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    public virtual ICollection<UnlockReward> UnlockRewards { get; set; } = new List<UnlockReward>();
}
