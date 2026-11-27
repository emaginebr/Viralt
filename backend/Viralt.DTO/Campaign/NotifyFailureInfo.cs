using System.Text.Json.Serialization;

namespace Viralt.DTO.Campaign
{
    public class NotifyFailureInfo
    {
        [JsonPropertyName("winnerId")]
        public long WinnerId { get; set; }

        [JsonPropertyName("clientName")]
        public string ClientName { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("motivo")]
        public string Motivo { get; set; }
    }
}
