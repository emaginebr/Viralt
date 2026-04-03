using HotChocolate.Types;
using Viralt.Domain.Models;

namespace Viralt.GraphQL.Types;

public class WinnerType : ObjectType<Winner>
{
    protected override void Configure(IObjectTypeDescriptor<Winner> descriptor)
    {
        descriptor.Field(w => w.Campaign).Type<NonNullType<ObjectType<Campaign>>>();
        descriptor.Field(w => w.Client).Type<NonNullType<ObjectType<Client>>>();
    }
}
