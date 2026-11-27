using HotChocolate.Types;
using Viralt.Domain.Models;

namespace Viralt.GraphQL.Types;

public class CampaignFieldType : ObjectType<CampaignField>
{
    protected override void Configure(IObjectTypeDescriptor<CampaignField> descriptor)
    {
        descriptor.BindFieldsImplicitly();
    }
}
