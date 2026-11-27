using HotChocolate.Types;
using Viralt.Domain.Models;

namespace Viralt.GraphQL.Public.Types;

public class ClientPublicType : ObjectType<Client>
{
    protected override void Configure(IObjectTypeDescriptor<Client> descriptor)
    {
        descriptor.Ignore(c => c.Email);
        descriptor.Ignore(c => c.Phone);
        descriptor.Ignore(c => c.IpAddress);
        descriptor.Ignore(c => c.UserAgent);
        descriptor.Ignore(c => c.Birthday);
        descriptor.Ignore(c => c.Token);
    }
}
