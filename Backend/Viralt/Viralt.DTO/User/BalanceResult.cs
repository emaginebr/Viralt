using System;
using System.Text.Json.Serialization;
using Viralt.DTO.Domain;

namespace Viralt.DTO.User
{
    public class BalanceResult : StatusResult
    {
        [JsonPropertyName("balance")]
        public BalanceInfo Balance { get; set; }
    }
}
