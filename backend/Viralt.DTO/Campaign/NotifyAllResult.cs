using System.Collections.Generic;
using System.Text.Json.Serialization;
using Viralt.DTO.Domain;

namespace Viralt.DTO.Campaign
{
    public class NotifyAllResult : StatusResult
    {
        [JsonPropertyName("total")]
        public int Total { get; set; }

        [JsonPropertyName("notificados")]
        public int Notificados { get; set; }

        [JsonPropertyName("falhas")]
        public List<NotifyFailureInfo> Falhas { get; set; } = new List<NotifyFailureInfo>();
    }
}
