using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Viralt.DTO.User
{
    public class UserInfo
    {
        [JsonPropertyName("userId")]
        public long UserId { get; set; }
        [JsonPropertyName("slug")]
        public string Slug { get; set; }
        [JsonPropertyName("imageUrl")]
        public string ImageUrl { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("email")]
        public string Email { get; set; }
        [JsonPropertyName("hash")]
        public string Hash { get; set; }
        [JsonPropertyName("password")]
        public string Password { get; set; }
        [JsonPropertyName("createAt")]
        public DateTime CreatedAt { get; set; }
        [JsonPropertyName("updateAt")]
        public DateTime UpdatedAt { get; set; }
    }
}
