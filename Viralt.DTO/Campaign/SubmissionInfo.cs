using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Viralt.DTO.Domain;

namespace Viralt.DTO.Campaign
{
    public class SubmissionInfo
    {
        [JsonPropertyName("submissionId")]
        public long SubmissionId { get; set; }

        [JsonPropertyName("campaignId")]
        public long CampaignId { get; set; }

        [JsonPropertyName("clientId")]
        public long ClientId { get; set; }

        [JsonPropertyName("fileUrl")]
        public string FileUrl { get; set; }

        [JsonPropertyName("fileType")]
        public int FileType { get; set; }

        [JsonPropertyName("caption")]
        public string Caption { get; set; }

        [JsonPropertyName("status")]
        public int Status { get; set; }

        [JsonPropertyName("voteCount")]
        public int VoteCount { get; set; }

        [JsonPropertyName("judgeScore")]
        public decimal? JudgeScore { get; set; }

        [JsonPropertyName("submittedAt")]
        public DateTime SubmittedAt { get; set; }
    }

    public class SubmissionInsertInfo
    {
        [JsonPropertyName("campaignId")]
        public long CampaignId { get; set; }

        [JsonPropertyName("clientId")]
        public long ClientId { get; set; }

        [JsonPropertyName("fileUrl")]
        public string FileUrl { get; set; }

        [JsonPropertyName("fileType")]
        public int FileType { get; set; }

        [JsonPropertyName("caption")]
        public string Caption { get; set; }
    }

    public class SubmissionListResult : StatusResult
    {
        [JsonPropertyName("submissions")]
        public IList<SubmissionInfo> Submissions { get; set; }
    }
}
