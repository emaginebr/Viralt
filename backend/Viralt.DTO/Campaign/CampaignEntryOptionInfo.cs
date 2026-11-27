using System;
using System.Text.Json.Serialization;

namespace Viralt.DTO.Campaign
{
    public class CampaignEntryOptionInfo
    {
        [JsonPropertyName("optionId")]
        public long OptionId { get; set; }

        [JsonPropertyName("entryId")]
        public long EntryId { get; set; }

        [JsonPropertyName("optionKey")]
        public string OptionKey { get; set; }

        [JsonPropertyName("optionValue")]
        public string OptionValue { get; set; }
    }
}