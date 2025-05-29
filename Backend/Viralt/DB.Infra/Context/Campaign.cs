using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class Campaign
{
    public long CampaignId { get; set; }

    public long UserId { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public int Status { get; set; }

    public bool NameRequired { get; set; }

    public bool EmailRequired { get; set; }

    public bool PhoneRequired { get; set; }

    public int? MinAge { get; set; }

    public string BgImage { get; set; }

    public string TopImage { get; set; }

    public string YoutubeUrl { get; set; }

    public string CustomCss { get; set; }

    public int? MinEntry { get; set; }

    public virtual ICollection<CampaignEntry> CampaignEntries { get; set; } = new List<CampaignEntry>();

    public virtual ICollection<CampaignField> CampaignFields { get; set; } = new List<CampaignField>();

    public virtual ICollection<Client> Clients { get; set; } = new List<Client>();

    public virtual User User { get; set; }
}
