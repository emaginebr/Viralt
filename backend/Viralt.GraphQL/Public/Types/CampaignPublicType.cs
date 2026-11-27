using HotChocolate.Types;
using Viralt.Domain.Models;

namespace Viralt.GraphQL.Public.Types;

public class CampaignPublicType : ObjectType<Campaign>
{
    protected override void Configure(IObjectTypeDescriptor<Campaign> descriptor)
    {
        descriptor.Ignore(c => c.Password);
        descriptor.Ignore(c => c.GeoCountries);
        descriptor.Ignore(c => c.WelcomeEmailBody);
        descriptor.Ignore(c => c.WelcomeEmailSubject);
        descriptor.Ignore(c => c.UserId);
    }
}
