using HotChocolate.Types;
using Viralt.Domain.Models;

namespace Viralt.GraphQL.Public.Types;

public class PrizePublicType : ObjectType<Prize>
{
    protected override void Configure(IObjectTypeDescriptor<Prize> descriptor)
    {
        descriptor.Ignore(p => p.CouponCode);
    }
}
