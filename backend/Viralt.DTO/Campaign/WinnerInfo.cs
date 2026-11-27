using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Viralt.DTO.Domain;

namespace Viralt.DTO.Campaign
{
    public class WinnerInfo
    {
        [JsonPropertyName("winnerId")]
        public long WinnerId { get; set; }

        [JsonPropertyName("campaignId")]
        public long CampaignId { get; set; }

        [JsonPropertyName("clientId")]
        public long ClientId { get; set; }

        [JsonPropertyName("prizeId")]
        public long? PrizeId { get; set; }

        [JsonPropertyName("selectedAt")]
        public DateTime SelectedAt { get; set; }

        [JsonPropertyName("selectionMethod")]
        public string SelectionMethod { get; set; }

        [JsonPropertyName("notified")]
        public bool Notified { get; set; }

        [JsonPropertyName("claimed")]
        public bool Claimed { get; set; }

        [JsonPropertyName("claimData")]
        public string ClaimData { get; set; }
    }

    public class WinnerListResult : StatusResult
    {
        [JsonPropertyName("winners")]
        public IList<WinnerInfo> Winners { get; set; }
    }
}
