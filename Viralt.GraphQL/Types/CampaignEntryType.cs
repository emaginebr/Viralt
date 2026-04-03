using HotChocolate.Types;
using Viralt.Domain.Models;

namespace Viralt.GraphQL.Types;

public class CampaignEntryType : ObjectType<CampaignEntry>
{
    protected override void Configure(IObjectTypeDescriptor<CampaignEntry> descriptor)
    {
        descriptor.BindFieldsImplicitly();
    }
}
