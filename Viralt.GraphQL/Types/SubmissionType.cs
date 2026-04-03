using HotChocolate.Types;
using Viralt.Domain.Models;

namespace Viralt.GraphQL.Types;

public class SubmissionType : ObjectType<Submission>
{
    protected override void Configure(IObjectTypeDescriptor<Submission> descriptor)
    {
        descriptor.BindFieldsImplicitly();
    }
}
