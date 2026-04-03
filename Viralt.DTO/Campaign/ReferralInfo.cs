using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Viralt.DTO.Domain;

namespace Viralt.DTO.Campaign
{
    public class ReferralInfo
    {
        [JsonPropertyName("referralId")]
        public long ReferralId { get; set; }

        [JsonPropertyName("campaignId")]
        public long CampaignId { get; set; }

        [JsonPropertyName("referrerClientId")]
        public long ReferrerClientId { get; set; }

        [JsonPropertyName("referredClientId")]
        public long ReferredClientId { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("bonusEntriesAwarded")]
        public int BonusEntriesAwarded { get; set; }

        [JsonPropertyName("referrerName")]
        public string ReferrerName { get; set; }

        [JsonPropertyName("referredName")]
        public string ReferredName { get; set; }
    }

    public class ReferralListResult : StatusResult
    {
        [JsonPropertyName("referrals")]
        public List<ReferralInfo> Referrals { get; set; } = new();
    }
}
