using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace Viralt.DTO.Campaign
{
    public class CampaignFieldOptionInfo
    {
        [JsonPropertyName("optionId")]
        public long OptionId { get; set; }

        [JsonPropertyName("fieldId")]
        public long FieldId { get; set; }

        [JsonPropertyName("optionKey")]
        public string OptionKey { get; set; }

        [JsonPropertyName("optionValue")]
        public string OptionValue { get; set; }
    }
}
