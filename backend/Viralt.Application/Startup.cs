using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using NAuth.ACL;
using NAuth.ACL.Interfaces;
using NAuth.DTO.Settings;
using Viralt.Domain.Interfaces.Core;
using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.Domain.Services;
using Viralt.DTO.Settings;
using Viralt.Infra;
using Viralt.Infra.AppServices;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces;
using Viralt.Infra.Interfaces.AppServices;
using Viralt.Infra.Interfaces.Repository;
using Viralt.Infra.Repository;
using Viralt.GraphQL;

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

        #region External integrations
        // Default IHttpClientFactory, required by WebhookService.
        services.AddHttpClient();

        services.Configure<MailerSendSetting>(configuration.GetSection("MailerSend"));
        services.Configure<S3Setting>(configuration.GetSection("S3"));

        services.AddHttpClient("MailerSend", (sp, client) =>
        {
            var setting = sp.GetRequiredService<IOptions<MailerSendSetting>>().Value;
            var apiUrl = string.IsNullOrWhiteSpace(setting.ApiUrl)
                ? "https://api.mailersend.com/v1/"
                : setting.ApiUrl.Trim();
            if (!apiUrl.EndsWith("/"))
                apiUrl += "/";
            client.BaseAddress = new Uri(apiUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddSingleton<IAmazonS3>(sp => CreateS3Client(sp.GetRequiredService<IOptions<S3Setting>>().Value));
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

    /// <summary>
    /// Builds the S3 client from <see cref="S3Setting"/> without ever throwing because of missing
    /// configuration. Required fields (BucketName, Region when ServiceUrl is empty, credentials)
    /// are validated on first use by the AppService (research R8).
    /// </summary>
    private static IAmazonS3 CreateS3Client(S3Setting setting)
    {
        var config = new AmazonS3Config();
        if (!string.IsNullOrWhiteSpace(setting.ServiceUrl))
        {
            config.ServiceURL = setting.ServiceUrl.Trim();
            config.ForcePathStyle = true;
            config.AuthenticationRegion = string.IsNullOrWhiteSpace(setting.Region) ? "us-east-1" : setting.Region.Trim();
        }
        else
        {
            // Placeholder when Region is missing, so the app still starts; the AppService
            // rejects an empty Region before any request is sent.
            config.RegionEndpoint = string.IsNullOrWhiteSpace(setting.Region)
                ? RegionEndpoint.USEast1
                : RegionEndpoint.GetBySystemName(setting.Region.Trim());
        }

        var hasAccessKey = !string.IsNullOrWhiteSpace(setting.AccessKey);
        var hasSecretKey = !string.IsNullOrWhiteSpace(setting.SecretKey);

        AWSCredentials credentials;
        if (hasAccessKey && hasSecretKey)
            credentials = new BasicAWSCredentials(setting.AccessKey.Trim(), setting.SecretKey.Trim());
        else if (!hasAccessKey && !hasSecretKey)
            credentials = new DeferredCredentials(() => FallbackCredentialsFactory.GetCredentials());
        else
            credentials = new DeferredCredentials(() => throw new InvalidOperationException(
                "S3__AccessKey e S3__SecretKey devem ser informadas juntas (ou ambas vazias para usar a cadeia padrão de credenciais)."));

        return new AmazonS3Client(credentials, config);
    }

    /// <summary>
    /// Resolves the underlying credentials only on the first S3 request, so a missing credential
    /// chain does not break application startup or DI resolution.
    /// </summary>
    private sealed class DeferredCredentials : AWSCredentials
    {
        private readonly Lazy<AWSCredentials> _inner;

        public DeferredCredentials(Func<AWSCredentials> factory)
        {
            _inner = new Lazy<AWSCredentials>(factory, LazyThreadSafetyMode.PublicationOnly);
        }

        public override ImmutableCredentials GetCredentials() => _inner.Value.GetCredentials();

        public override Task<ImmutableCredentials> GetCredentialsAsync() => _inner.Value.GetCredentialsAsync();
    }
}
