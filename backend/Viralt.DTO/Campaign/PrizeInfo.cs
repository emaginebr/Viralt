using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Viralt.DTO.Domain;

namespace Viralt.DTO.Campaign
{
    public class PrizeInfo
    {
        [JsonPropertyName("prizeId")]
        public long PrizeId { get; set; }

        [JsonPropertyName("campaignId")]
        public long CampaignId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("image")]
        public string Image { get; set; }

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [JsonPropertyName("prizeType")]
        public string PrizeType { get; set; }

        [JsonPropertyName("couponCode")]
        public string CouponCode { get; set; }

        [JsonPropertyName("sortOrder")]
        public int SortOrder { get; set; }

        [JsonPropertyName("minEntriesRequired")]
        public int MinEntriesRequired { get; set; }
    }

    public class PrizeInsertInfo
    {
        [JsonPropertyName("campaignId")]
        public long CampaignId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("image")]
        public string Image { get; set; }

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [JsonPropertyName("prizeType")]
        public string PrizeType { get; set; }

        [JsonPropertyName("couponCode")]
        public string CouponCode { get; set; }

        [JsonPropertyName("sortOrder")]
        public int SortOrder { get; set; }

        [JsonPropertyName("minEntriesRequired")]
        public int MinEntriesRequired { get; set; }
    }

    public class PrizeUpdateInfo : PrizeInsertInfo
    {
        [JsonPropertyName("prizeId")]
        public long PrizeId { get; set; }
    }

    public class PrizeListResult : StatusResult
    {
        [JsonPropertyName("prizes")]
        public IList<PrizeInfo> Prizes { get; set; }
    }

    public class PrizeGetResult : StatusResult
    {
        [JsonPropertyName("prize")]
        public PrizeInfo Prize { get; set; }
    }
}
