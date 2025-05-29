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
    }
}
