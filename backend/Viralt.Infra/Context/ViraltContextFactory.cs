using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Viralt.Infra.Context;

/// <summary>
/// Design-time factory for EF Core migrations.
/// Used by `dotnet ef migrations add` when no running host is available.
/// </summary>
public class ViraltContextFactory : IDesignTimeDbContextFactory<ViraltContext>
{
    public ViraltContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "..", "Viralt.API"))
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("ViraltContext")
            ?? "Host=localhost;Port=5432;Database=viralt;Username=postgres;Password=changeme";

        var optionsBuilder = new DbContextOptionsBuilder<ViraltContext>();
        optionsBuilder
            .UseLazyLoadingProxies()
            .UseNpgsql(connectionString);

        return new ViraltContext(optionsBuilder.Options);
    }
}
