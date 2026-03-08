using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class CampaignFieldOption
{
    public long OptionId { get; set; }

    public long FieldId { get; set; }

    public string OptionKey { get; set; }

    public string OptionValue { get; set; }

    public virtual CampaignField Field { get; set; }
}
