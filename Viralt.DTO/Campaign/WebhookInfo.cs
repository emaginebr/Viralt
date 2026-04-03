using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Viralt.DTO.Domain;

namespace Viralt.DTO.Campaign
{
    public class WebhookInfo
    {
        [JsonPropertyName("webhookId")]
        public long WebhookId { get; set; }

        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; }

        [JsonPropertyName("secret")]
        public string Secret { get; set; }

        [JsonPropertyName("events")]
        public string Events { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }
    }

    public class WebhookInsertInfo
    {
        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; }

        [JsonPropertyName("secret")]
        public string Secret { get; set; }

        [JsonPropertyName("events")]
        public string Events { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }

    public class WebhookUpdateInfo : WebhookInsertInfo
    {
        [JsonPropertyName("webhookId")]
        public long WebhookId { get; set; }
    }

    public class WebhookListResult : StatusResult
    {
        [JsonPropertyName("webhooks")]
        public IList<WebhookInfo> Webhooks { get; set; }
    }
}
