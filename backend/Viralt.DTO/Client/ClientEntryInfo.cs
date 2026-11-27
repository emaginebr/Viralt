using System;
using System.Text.Json.Serialization;

namespace Viralt.DTO.Client
{
    public class ClientEntryInfo
    {
        [JsonPropertyName("clientEntryId")]
        public long ClientEntryId { get; set; }

        [JsonPropertyName("clientId")]
        public long ClientId { get; set; }

        [JsonPropertyName("entryId")]
        public long EntryId { get; set; }

        [JsonPropertyName("status")]
        public int Status { get; set; }

        [JsonPropertyName("entryValue")]
        public string EntryValue { get; set; }

        [JsonPropertyName("completedAt")]
        public DateTime? CompletedAt { get; set; }

        [JsonPropertyName("verified")]
        public bool Verified { get; set; }

        [JsonPropertyName("verificationData")]
        public string VerificationData { get; set; }

        [JsonPropertyName("entriesEarned")]
        public int EntriesEarned { get; set; }
    }
}