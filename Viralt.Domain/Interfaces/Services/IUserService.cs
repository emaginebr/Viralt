using Microsoft.AspNetCore.Http;
using Viralt.DTO.User;

namespace Viralt.Domain.Interfaces.Services;

public interface IUserService
{
    UserInfo LoginWithEmail(string email, string password);
    string LoginAndGenerateToken(string email, string password);
    bool HasPassword(long userId);
    void ChangePasswordUsingHash(string recoveryHash, string newPassword);
    void ChangePassword(long userId, string oldPassword, string newPassword);
    Task<bool> SendRecoveryEmail(string email);
    UserInfo Insert(UserInfo user);
    UserInfo Update(UserInfo user);
    UserInfo GetUserByEmail(string email);
    UserInfo GetBySlug(string slug);
    UserInfo GetUserByID(long userId);
    UserInfo GetUserByToken(string token);
    UserInfo GetUserInSession(HttpContext httpContext);
    IList<UserInfo> ListUsers(int take);
    string UpdateUserImage(Stream stream, long userId);
}
