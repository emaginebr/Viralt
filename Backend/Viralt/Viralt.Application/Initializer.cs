using Core.Domain;
using Core.Domain.Cloud;
using Core.Domain.Repository;
using DB.Infra;
using DB.Infra.Context;
using DB.Infra.Repository;
using Viralt.Domain.Impl.Core;
using Viralt.Domain.Impl.Factory;
using Viralt.Domain.Impl.Services;
using Viralt.Domain.Interfaces.Core;
using Viralt.Domain.Interfaces.Factory;
using Viralt.Domain.Interfaces.Models;
using Viralt.Domain.Interfaces.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using Viralt.Domain;

namespace Viralt.Application
{
    public static class Initializer
    {

        private static void injectDependency(Type serviceType, Type implementationType, IServiceCollection services, bool scoped = true)
        {
            if(scoped)
                services.AddScoped(serviceType, implementationType);
            else
                services.AddTransient(serviceType, implementationType);
        }
        public static void Configure(IServiceCollection services, ConfigurationParam config, bool scoped = true)
        {
            if (scoped)
                services.AddDbContext<ViraltContext>(x => x.UseLazyLoadingProxies().UseNpgsql(config.ConnectionString));
            else
                services.AddDbContextFactory<ViraltContext>(x => x.UseLazyLoadingProxies().UseNpgsql(config.ConnectionString));

            #region Infra
            injectDependency(typeof(ViraltContext), typeof(ViraltContext), services, scoped);
            injectDependency(typeof(IUnitOfWork), typeof(UnitOfWork), services, scoped);
            injectDependency(typeof(ILogCore), typeof(LogCore), services, scoped);
            #endregion

            #region Repository
            injectDependency(typeof(IUserRepository<IUserModel, IUserDomainFactory>), typeof(UserRepository), services, scoped);
            injectDependency(typeof(ICampaignRepository<ICampaignModel, ICampaignDomainFactory>), typeof(CampaignRepository), services, scoped);
            injectDependency(typeof(ICampaignFieldRepository<ICampaignFieldModel, ICampaignFieldDomainFactory>), typeof(CampaignFieldRepository), services, scoped);
            injectDependency(typeof(ICampaignFieldOptionRepository<ICampaignFieldOptionModel, ICampaignFieldOptionDomainFactory>), typeof(CampaignFieldOptionRepository), services, scoped);
            injectDependency(typeof(ICampaignEntryRepository<ICampaignEntryModel, ICampaignEntryDomainFactory>), typeof(CampaignEntryRepository), services, scoped);
            injectDependency(typeof(ICampaignEntryOptionRepository<ICampaignEntryOptionModel, ICampaignEntryOptionDomainFactory>), typeof(CampaignEntryOptionRepository), services, scoped);
            injectDependency(typeof(IClientRepository<IClientModel, IClientDomainFactory>), typeof(ClientRepository), services, scoped);
            injectDependency(typeof(IClientEntryRepository<IClientEntryModel, IClientEntryDomainFactory>), typeof(ClientEntryRepository), services, scoped);
            #endregion

            #region Service
            injectDependency(typeof(IImageService), typeof(ImageService), services, scoped);
            injectDependency(typeof(IUserService), typeof(UserService), services, scoped);
            injectDependency(typeof(IMailerSendService), typeof(MailerSendService), services, scoped);
            injectDependency(typeof(ICampaignService), typeof(CampaignService), services, scoped);
            injectDependency(typeof(IClientService), typeof(ClientService), services, scoped);
            #endregion

            #region Factory
            injectDependency(typeof(IUserDomainFactory), typeof(UserDomainFactory), services, scoped);
            injectDependency(typeof(ICampaignDomainFactory), typeof(CampaignDomainFactory), services, scoped);
            injectDependency(typeof(ICampaignFieldDomainFactory), typeof(CampaignFieldDomainFactory), services, scoped);
            injectDependency(typeof(ICampaignFieldOptionDomainFactory), typeof(CampaignFieldOptionDomainFactory), services, scoped);
            injectDependency(typeof(ICampaignEntryDomainFactory), typeof(CampaignEntryDomainFactory), services, scoped);
            injectDependency(typeof(ICampaignEntryOptionDomainFactory), typeof(CampaignEntryOptionDomainFactory), services, scoped);
            injectDependency(typeof(IClientDomainFactory), typeof(ClientDomainFactory), services, scoped);
            injectDependency(typeof(IClientEntryDomainFactory), typeof(ClientEntryDomainFactory), services, scoped);
            #endregion


            services.AddAuthentication("BasicAuthentication")
                .AddScheme<AuthenticationSchemeOptions, AuthHandler>("BasicAuthentication", null);

        }
    }
}
