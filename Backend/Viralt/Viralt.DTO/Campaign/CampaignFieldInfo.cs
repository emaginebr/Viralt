using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace Viralt.DTO.Campaign
{
    public class CampaignFieldInfo
    {
        [JsonPropertyName("fieldId")]
        public long FieldId { get; set; }

        [JsonPropertyName("campaignId")]
        public long CampaignId { get; set; }

        [JsonPropertyName("fieldType")]
        public int FieldType { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("required")]
        public bool Required { get; set; }
    }
}
