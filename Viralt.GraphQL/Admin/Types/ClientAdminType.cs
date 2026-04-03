using HotChocolate.Types;
using Viralt.Domain.Models;

namespace Viralt.GraphQL.Admin.Types;

public class ClientAdminType : ObjectType<Client>
{
    protected override void Configure(IObjectTypeDescriptor<Client> descriptor)
    {
        descriptor.Field(c => c.Campaign).Type<NonNullType<ObjectType<Campaign>>>();
    }
}
