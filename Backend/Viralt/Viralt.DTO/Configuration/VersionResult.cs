using System;
using System.Text.Json.Serialization;
using Viralt.DTO.Domain;

namespace Viralt.DTO.Configuration
{
    public class VersionResult : StatusResult
    {
        [JsonPropertyName("version")]
        public string Version { get; set; }
    }
}
