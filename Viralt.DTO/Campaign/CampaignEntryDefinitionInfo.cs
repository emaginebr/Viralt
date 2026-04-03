using System.Text.Json.Serialization;

namespace Viralt.DTO.Campaign;

public class CampaignEntryDefinitionInfo
{
    [JsonPropertyName("entryId")]
    public long EntryId { get; set; }

    [JsonPropertyName("campaignId")]
    public long CampaignId { get; set; }

    [JsonPropertyName("entryType")]
    public int EntryType { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; }

    [JsonPropertyName("entries")]
    public int Entries { get; set; }

    [JsonPropertyName("daily")]
    public bool Daily { get; set; }

    [JsonPropertyName("mandatory")]
    public bool Mandatory { get; set; }

    [JsonPropertyName("entryLabel")]
    public string EntryLabel { get; set; }

    [JsonPropertyName("entryValue")]
    public string EntryValue { get; set; }

    [JsonPropertyName("sortOrder")]
    public int SortOrder { get; set; }

    [JsonPropertyName("icon")]
    public string Icon { get; set; }

    [JsonPropertyName("instructions")]
    public string Instructions { get; set; }

    [JsonPropertyName("requireVerification")]
    public bool RequireVerification { get; set; }

    [JsonPropertyName("targetUrl")]
    public string TargetUrl { get; set; }

    [JsonPropertyName("externalProvider")]
    public string ExternalProvider { get; set; }

    [JsonPropertyName("externalEntryId")]
    public string ExternalEntryId { get; set; }
}

public class CampaignEntryReorderInfo
{
    [JsonPropertyName("entryId")]
    public long EntryId { get; set; }

    [JsonPropertyName("sortOrder")]
    public int SortOrder { get; set; }
}
