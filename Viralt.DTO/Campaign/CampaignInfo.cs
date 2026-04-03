using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Viralt.DTO.Campaign
{
    public class CampaignInfo
    {
        [JsonPropertyName("campaignId")]
        public long CampaignId { get; set; }

        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("startTime")]
        public DateTime? StartTime { get; set; }

        [JsonPropertyName("endTime")]
        public DateTime? EndTime { get; set; }

        [JsonPropertyName("status")]
        public int Status { get; set; }

        [JsonPropertyName("nameRequired")]
        public bool NameRequired { get; set; }

        [JsonPropertyName("emailRequired")]
        public bool EmailRequired { get; set; }

        [JsonPropertyName("phoneRequired")]
        public bool PhoneRequired { get; set; }

        [JsonPropertyName("minAge")]
        public int? MinAge { get; set; }

        [JsonPropertyName("bgImage")]
        public string BgImage { get; set; }

        [JsonPropertyName("topImage")]
        public string TopImage { get; set; }

        [JsonPropertyName("youtubeUrl")]
        public string YoutubeUrl { get; set; }

        [JsonPropertyName("customCss")]
        public string CustomCss { get; set; }

        [JsonPropertyName("minEntry")]
        public int? MinEntry { get; set; }

        [JsonPropertyName("slug")]
        public string Slug { get; set; }

        [JsonPropertyName("timezone")]
        public string Timezone { get; set; }

        [JsonPropertyName("maxEntriesPerUser")]
        public int? MaxEntriesPerUser { get; set; }

        [JsonPropertyName("winnerCount")]
        public int? WinnerCount { get; set; }

        [JsonPropertyName("isPublished")]
        public bool IsPublished { get; set; }

        [JsonPropertyName("password")]
        public string Password { get; set; }

        [JsonPropertyName("themePrimaryColor")]
        public string ThemePrimaryColor { get; set; }

        [JsonPropertyName("themeSecondaryColor")]
        public string ThemeSecondaryColor { get; set; }

        [JsonPropertyName("themeBgColor")]
        public string ThemeBgColor { get; set; }

        [JsonPropertyName("themeFont")]
        public string ThemeFont { get; set; }

        [JsonPropertyName("logoImage")]
        public string LogoImage { get; set; }

        [JsonPropertyName("termsUrl")]
        public string TermsUrl { get; set; }

        [JsonPropertyName("redirectUrl")]
        public string RedirectUrl { get; set; }

        [JsonPropertyName("welcomeEmailEnabled")]
        public bool WelcomeEmailEnabled { get; set; }

        [JsonPropertyName("welcomeEmailSubject")]
        public string WelcomeEmailSubject { get; set; }

        [JsonPropertyName("welcomeEmailBody")]
        public string WelcomeEmailBody { get; set; }

        [JsonPropertyName("geoCountries")]
        public string GeoCountries { get; set; }

        [JsonPropertyName("blockVpn")]
        public bool BlockVpn { get; set; }

        [JsonPropertyName("requireEmailVerification")]
        public bool RequireEmailVerification { get; set; }

        [JsonPropertyName("entryType")]
        public string EntryType { get; set; }

        [JsonPropertyName("totalEntries")]
        public long TotalEntries { get; set; }

        [JsonPropertyName("totalParticipants")]
        public long TotalParticipants { get; set; }

        [JsonPropertyName("viewCount")]
        public long ViewCount { get; set; }

        [JsonPropertyName("gaTrackingId")]
        public string GaTrackingId { get; set; }

        [JsonPropertyName("fbPixelId")]
        public string FbPixelId { get; set; }

        [JsonPropertyName("tiktokPixelId")]
        public string TiktokPixelId { get; set; }

        [JsonPropertyName("gtmId")]
        public string GtmId { get; set; }

        [JsonPropertyName("brandId")]
        public long? BrandId { get; set; }

        [JsonPropertyName("language")]
        public string Language { get; set; }
    }
}
