using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class ClientEntry
{
    public long ClientEntryId { get; set; }

    public long ClientId { get; set; }

    public long EntryId { get; set; }

    public int Status { get; set; }

    public string EntryValue { get; set; }

    public virtual Client Client { get; set; }

    public virtual CampaignEntry Entry { get; set; }
}
