using HotChocolate.Types.Pagination;
using Microsoft.Extensions.DependencyInjection;
using Viralt.GraphQL.Public.Types;
using Viralt.GraphQL.Types;

namespace Viralt.GraphQL;

public static class GraphQLServiceExtensions
{
    public static IServiceCollection AddViraltGraphQL(this IServiceCollection services)
    {
        services
            .AddGraphQLServer()
            .AddDiagnosticEventListener<GraphQLErrorLogger>()
            .AddQueryType()
            .AddTypeExtension<Admin.AdminQuery>()
            .AddTypeExtension<Public.PublicQuery>()
            .AddType<CampaignEntryType>()
            .AddType<CampaignFieldType>()
            .AddType<PrizeType>()
            .AddType<WinnerType>()
            .AddType<SubmissionType>()
            .AddType<CampaignPublicType>()
            .AddType<ClientPublicType>()
            .ModifyPagingOptions(opt =>
            {
                opt.MaxPageSize = 50;
                opt.DefaultPageSize = 10;
                opt.IncludeTotalCount = true;
            })
            .AddFiltering()
            .AddSorting()
            .AddProjections()
            .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = true);

        return services;
    }
}
