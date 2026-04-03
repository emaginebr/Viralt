using HotChocolate.Types;
using Viralt.Domain.Models;

namespace Viralt.GraphQL.Types;

public class PrizeType : ObjectType<Prize>
{
    protected override void Configure(IObjectTypeDescriptor<Prize> descriptor)
    {
        descriptor.BindFieldsImplicitly();
        descriptor.Ignore(p => p.CouponCode);
    }
}
