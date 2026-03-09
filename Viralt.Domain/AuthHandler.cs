using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Viralt.Domain.Interfaces.Services;
using Viralt.DTO.User;
using System.Net.Http.Headers;
using System.Text.Encodings.Web;

namespace Viralt.Domain;

public class AuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly IUserService _userService;

    public AuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock,
        IUserService userService)
        : base(options, logger, encoder, clock)
    {
        _userService = userService;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.ContainsKey("Authorization"))
            return AuthenticateResult.Fail("Missing Authorization Header");

        UserInfo user = null;
        try
        {
            var authHeader = AuthenticationHeaderValue.Parse(Request.Headers["Authorization"]);
            var token = authHeader.Parameter;
            if (string.IsNullOrEmpty(token))
                return AuthenticateResult.Fail("Missing Authorization Token");

            user = _userService.GetUserByToken(token);
            if (user == null)
                return AuthenticateResult.Fail("Invalid Session");
        }
        catch (Exception)
        {
            return AuthenticateResult.Fail("Invalid Authorization Header");
        }

        var claims = new[] {
            new Claim("UserInfo", JsonConvert.SerializeObject(new UserInfo {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
            }))
        };
        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}
