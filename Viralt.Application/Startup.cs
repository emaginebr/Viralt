using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Viralt.Domain;
using Viralt.Domain.Interfaces.Core;
using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.Domain.Services;
using Viralt.Infra;
using Viralt.Infra.AppServices;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces;
using Viralt.Infra.Interfaces.AppServices;
using Viralt.Infra.Interfaces.Repository;
using Viralt.Infra.Repository;

namespace Viralt.Application;

public static class Startup
{
    public static IServiceCollection ConfigureServices(
        this IServiceCollection services,
        string connectionString,
        bool scoped = true)
    {
        #region DbContext
        if (scoped)
            services.AddDbContext<ViraltContext>(x => x.UseLazyLoadingProxies().UseNpgsql(connectionString));
        else
            services.AddDbContextFactory<ViraltContext>(x => x.UseLazyLoadingProxies().UseNpgsql(connectionString));
        #endregion

        #region Infra
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ILogCore, LogCore>();
        #endregion

        #region Repository
        services.AddScoped<IUserRepository<User>, UserRepository>();
        services.AddScoped<ICampaignRepository<Campaign>, CampaignRepository>();
        services.AddScoped<ICampaignFieldRepository<CampaignField>, CampaignFieldRepository>();
        services.AddScoped<ICampaignFieldOptionRepository<CampaignFieldOption>, CampaignFieldOptionRepository>();
        services.AddScoped<ICampaignEntryRepository<CampaignEntry>, CampaignEntryRepository>();
        services.AddScoped<ICampaignEntryOptionRepository<CampaignEntryOption>, CampaignEntryOptionRepository>();
        services.AddScoped<IClientRepository<Client>, ClientRepository>();
        services.AddScoped<IClientEntryRepository<ClientEntry>, ClientEntryRepository>();
        #endregion

        #region AppServices
        services.AddScoped<IImageAppService, ImageAppService>();
        services.AddScoped<IMailerSendAppService, MailerSendAppService>();
        #endregion

        #region Domain Services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICampaignService, CampaignService>();
        services.AddScoped<IClientService, ClientService>();
        #endregion

        #region Authentication
        services.AddAuthentication("BasicAuthentication")
            .AddScheme<AuthenticationSchemeOptions, AuthHandler>("BasicAuthentication", null);
        #endregion

        return services;
    }
}
