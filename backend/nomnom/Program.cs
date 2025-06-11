using BlinkHttp.Application;
using BlinkHttp.Authentication;
using BlinkHttp.Configuration;
using BlinkDatabase.PostgreSql;
using nomnom.Content;
using nomnom.Services;
using nomnom.BackgroundServices;
using nomnom.Location;

namespace nomnom;

internal class Program
{
    private static async Task Main(string[] args)
    {
        ApplicationConfiguration config = GetConfiguration();
        WebApplicationBuilder builder = new WebApplicationBuilder();

        builder.ConfigureLogging(l => l.UseConsole()
                                       .SetConsoleLogFormat("%T %level:\n\t%name => %scope %message")
                                       .UseFile()
                                       .SetFileLogFormat("%D %level [%name] %scope %message")
                                       .EnableColorfulConsole());

        builder.Services
            .AddConfiguration(config)
            .AddPostgreSql()
            .AddSingleton<IFilesProvider, FilesProvider>()
            .AddSingleton<IUserInfoProvider, UserInfoProvider>()
            .AddSingleton<ILocationService, LocationService>()
            .AddBackgroundService(new OrdersService(), true);

        builder
            .UseConfiguration()
            .UseSessionAuthorization(opt => opt.EnableSessionExpiration(TimeSpan.FromHours(1)))
            .AddGlobalCORS(opt =>
            {
                opt.Origin = config.Get<string>("cors:origin");
                opt.Headers = config.Get<string>("cors:headers");
                opt.Credentials = config.Get<bool>("cors:credentials");
                opt.Methods = config.Get<string>("cors:methods");
            })
            .SetRoutePrefix(config["route_prefix"]);

        WebApplication app = builder.Build();
        await app.Run(args);
    }

    private static ApplicationConfiguration GetConfiguration()
    {
        ApplicationConfiguration config = new ApplicationConfiguration();
        config.LoadConfiguration();
        return config;
    }
}
