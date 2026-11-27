using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Viralt.DTO.Domain;

namespace Viralt.DTO.Campaign
{
    public class BrandInfo
    {
        [JsonPropertyName("brandId")]
        public long BrandId { get; set; }

        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("slug")]
        public string Slug { get; set; }

        [JsonPropertyName("logoImage")]
        public string LogoImage { get; set; }

        [JsonPropertyName("primaryColor")]
        public string PrimaryColor { get; set; }

        [JsonPropertyName("customDomain")]
        public string CustomDomain { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }
    }

    public class BrandInsertInfo
    {
        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("slug")]
        public string Slug { get; set; }

        [JsonPropertyName("logoImage")]
        public string LogoImage { get; set; }

        [JsonPropertyName("primaryColor")]
        public string PrimaryColor { get; set; }

        [JsonPropertyName("customDomain")]
        public string CustomDomain { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }
    }

    public class BrandUpdateInfo : BrandInsertInfo
    {
        [JsonPropertyName("brandId")]
        public long BrandId { get; set; }
    }

    public class BrandListResult : StatusResult
    {
        [JsonPropertyName("brands")]
        public IList<BrandInfo> Brands { get; set; }
    }
}
