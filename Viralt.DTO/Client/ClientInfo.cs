using System;
using System.Text.Json.Serialization;

namespace Viralt.DTO.Client
{
    public class ClientInfo
    {
        [JsonPropertyName("clientId")]
        public long ClientId { get; set; }

        [JsonPropertyName("campaignId")]
        public long CampaignId { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("token")]
        public string Token { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("birthday")]
        public DateTime? Birthday { get; set; }

        [JsonPropertyName("status")]
        public int? Status { get; set; }
    }
}