using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NAuth.ACL;
using NAuth.ACL.Interfaces;
using NAuth.DTO.Settings;
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
using Viralt.GraphQL;
using zTools.ACL;
using zTools.ACL.Interfaces;
using zTools.DTO.Settings;

namespace Viralt.Application;

public static class Startup
{
    public static IServiceCollection ConfigureServices(
        this IServiceCollection services,
        string connectionString,
        IConfiguration configuration,
        bool scoped = true)
    {
        #region DbContext
        if (scoped)
            services.AddDbContext<ViraltContext>(x => x.UseLazyLoadingProxies().UseNpgsql(connectionString));
        else
            services.AddDbContextFactory<ViraltContext>(x => x.UseLazyLoadingProxies().UseNpgsql(connectionString));
        #endregion

        #region zTools
        services.Configure<zToolsetting>(configuration.GetSection("zTools"));
        services.AddHttpClient();
        services.AddScoped<zTools.ACL.Interfaces.IFileClient, zTools.ACL.FileClient>();
        services.AddScoped<zTools.ACL.Interfaces.IMailClient, zTools.ACL.MailClient>();
        services.AddScoped<zTools.ACL.Interfaces.IStringClient, zTools.ACL.StringClient>();
        #endregion

        #region NAuth
        services.Configure<NAuthSetting>(configuration.GetSection("NAuth"));
        services.AddScoped<IUserClient, UserClient>();
        #endregion

        #region Authentication
        services.AddAuthentication("BasicAuthentication")
            .AddScheme<AuthenticationSchemeOptions, NAuthHandler>("BasicAuthentication", null);
        #endregion

        #region Infra
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ILogCore, LogCore>();
        #endregion

        #region Repository
        services.AddScoped<ICampaignRepository<Campaign>, CampaignRepository>();
        services.AddScoped<ICampaignFieldRepository<CampaignField>, CampaignFieldRepository>();
        services.AddScoped<ICampaignFieldOptionRepository<CampaignFieldOption>, CampaignFieldOptionRepository>();
        services.AddScoped<ICampaignEntryRepository<CampaignEntry>, CampaignEntryRepository>();
        services.AddScoped<ICampaignEntryOptionRepository<CampaignEntryOption>, CampaignEntryOptionRepository>();
        services.AddScoped<IClientRepository<Client>, ClientRepository>();
        services.AddScoped<IClientEntryRepository<ClientEntry>, ClientEntryRepository>();
        services.AddScoped<IPrizeRepository<Prize>, PrizeRepository>();
        services.AddScoped<IWinnerRepository<Winner>, WinnerRepository>();
        services.AddScoped<ICampaignViewRepository<CampaignView>, CampaignViewRepository>();
        services.AddScoped<IBrandRepository<Brand>, BrandRepository>();
        services.AddScoped<IReferralRepository<Referral>, ReferralRepository>();
        services.AddScoped<ISubmissionRepository<Submission>, SubmissionRepository>();
        services.AddScoped<IVoteRepository<Vote>, VoteRepository>();
        services.AddScoped<IWebhookRepository<Webhook>, WebhookRepository>();
        services.AddScoped<IUnlockRewardRepository<UnlockReward>, UnlockRewardRepository>();
        services.AddScoped<IClientRewardRepository<ClientReward>, ClientRewardRepository>();
        #endregion

        #region AppServices
        services.AddScoped<IImageAppService, ImageAppService>();
        services.AddScoped<IMailerSendAppService, MailerSendAppService>();
        #endregion

        #region Domain Services
        services.AddScoped<ICampaignService, CampaignService>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IPrizeService, PrizeService>();
        services.AddScoped<IWinnerService, WinnerService>();
        services.AddScoped<IReferralService, ReferralService>();
        services.AddScoped<ISubmissionService, SubmissionService>();
        services.AddScoped<IWebhookService, WebhookService>();
        services.AddScoped<IBrandService, BrandService>();
        #endregion

        #region GraphQL
        services.AddViraltGraphQL();
        #endregion

        return services;
    }
}
