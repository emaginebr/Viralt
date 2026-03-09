using System.Linq;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.Domain.Utils;
using Viralt.DTO.MailerSend;
using Viralt.DTO.User;
using Viralt.Infra.Interfaces.AppServices;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class UserService : IUserService
{
    private readonly IUserRepository<User> _userRepository;
    private readonly IMailerSendAppService _mailerSendAppService;
    private readonly IImageAppService _imageAppService;

    public UserService(
        IUserRepository<User> userRepository,
        IMailerSendAppService mailerSendAppService,
        IImageAppService imageAppService)
    {
        _userRepository = userRepository;
        _mailerSendAppService = mailerSendAppService;
        _imageAppService = imageAppService;
    }

    public UserInfo LoginWithEmail(string email, string password)
    {
        var user = _userRepository.GetByEmail(email);
        if (user == null)
            throw new Exception("User not found");

        string encryptPwd = user.EncryptPassword(password);
        var loggedUser = _userRepository.LoginWithEmail(email, encryptPwd);
        return MapToDto(loggedUser);
    }

    public string LoginAndGenerateToken(string email, string password)
    {
        var user = _userRepository.GetByEmail(email);
        if (user == null)
            throw new Exception("User not found");

        string encryptPwd = user.EncryptPassword(password);
        var loggedUser = _userRepository.LoginWithEmail(email, encryptPwd);
        if (loggedUser == null)
            return null;

        var token = loggedUser.GenerateNewToken();
        _userRepository.UpdateToken(loggedUser.UserId, token);
        return token;
    }

    public bool HasPassword(long userId)
    {
        return _userRepository.HasPassword(userId);
    }

    public void ChangePasswordUsingHash(string recoveryHash, string newPassword)
    {
        if (string.IsNullOrEmpty(recoveryHash))
            throw new Exception("Recovery hash cant be empty");
        if (string.IsNullOrEmpty(newPassword))
            throw new Exception("Password cant be empty");

        var user = _userRepository.GetByRecoveryHash(recoveryHash);
        if (user == null)
            throw new Exception("User not found");

        string encryptPwd = user.EncryptPassword(newPassword);
        _userRepository.ChangePassword(user.UserId, encryptPwd);
    }

    public void ChangePassword(long userId, string oldPassword, string newPassword)
    {
        bool hasPassword = HasPassword(userId);
        if (hasPassword && string.IsNullOrEmpty(oldPassword))
            throw new Exception("Old password cant be empty");
        if (string.IsNullOrEmpty(newPassword))
            throw new Exception("New password cant be empty");

        var user = _userRepository.GetById(userId);
        if (user == null)
            throw new Exception("User not found");
        if (string.IsNullOrEmpty(user.Email))
            throw new Exception("To change password you need a email");

        if (hasPassword)
        {
            string encryptOld = user.EncryptPassword(oldPassword);
            var mdUser = _userRepository.LoginWithEmail(user.Email, encryptOld);
            if (mdUser == null)
                throw new Exception("Email or password is wrong");
        }

        string encryptNew = user.EncryptPassword(newPassword);
        _userRepository.ChangePassword(user.UserId, encryptNew);
    }

    public async Task<bool> SendRecoveryEmail(string email)
    {
        if (string.IsNullOrEmpty(email))
            throw new Exception("Email cant be empty");

        var user = _userRepository.GetByEmail(email);
        if (user == null)
            throw new Exception("User not found");

        var recoveryHash = user.GenerateRecoveryHash();
        _userRepository.UpdateRecoveryHash(user.UserId, recoveryHash);

        var recoveryUrl = $"https://nochainswap.org/recoverypassword/{recoveryHash}";

        var textMessage =
            $"Hi {user.Name},\r\n\r\n" +
            "We received a request to reset your password. If you made this request, " +
            "please click the link below to reset your password:\r\n\r\n" +
            recoveryUrl + "\r\n\r\n" +
            "If you didn't request a password reset, please ignore this email or contact " +
            "our support team if you have any concerns.\r\n\r\n" +
            "Best regards,\r\n" +
            "NoChainSwap Team";
        var htmlMessage =
            $"Hi <b>{user.Name}</b>,<br />\r\n<br />\r\n" +
            "We received a request to reset your password. If you made this request, " +
            "please click the link below to reset your password:<br />\r\n<br />\r\n" +
            $"<a href=\"{recoveryUrl}\">{recoveryUrl}</a><br />\r\n<br />\r\n" +
            "If you didn't request a password reset, please ignore this email or contact " +
            "our support team if you have any concerns.<br />\r\n<br />\r\n" +
            "Best regards,<br />\r\n" +
            "<b>NoChainSwap Team</b>";

        var mail = new MailerInfo
        {
            From = new MailerRecipientInfo
            {
                Email = "contact@nochainswap.org",
                Name = "NoChainSwap Mailmaster"
            },
            To = new List<MailerRecipientInfo> {
                new MailerRecipientInfo {
                    Email = user.Email,
                    Name = user.Name ?? user.Email
                }
            },
            Subject = "[NoChainSwap] Password Recovery Email",
            Text = textMessage,
            Html = htmlMessage
        };
        await _mailerSendAppService.SendMail(mail);
        return true;
    }

    public UserInfo Insert(UserInfo userInfo)
    {
        if (string.IsNullOrEmpty(userInfo.Name))
            throw new Exception("Name is empty");
        if (string.IsNullOrEmpty(userInfo.Email))
            throw new Exception("Email is empty");
        if (!EmailValidator.IsValidEmail(userInfo.Email))
            throw new Exception("Email is not valid");

        var existingUser = _userRepository.GetByEmail(userInfo.Email);
        if (existingUser != null)
            throw new Exception("User with email already registered");

        if (string.IsNullOrEmpty(userInfo.Password))
            throw new Exception("Password is empty");

        var user = new User
        {
            Name = userInfo.Name,
            Email = userInfo.Email,
            Slug = userInfo.Slug,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
            Hash = GetUniqueToken(),
            Status = 1
        };

        user.Slug = GenerateSlug(user);
        var saved = _userRepository.Insert(user);

        string encryptPwd = saved.EncryptPassword(userInfo.Password);
        _userRepository.ChangePassword(saved.UserId, encryptPwd);

        return MapToDto(saved);
    }

    public UserInfo Update(UserInfo userInfo)
    {
        if (!(userInfo.UserId > 0))
            throw new Exception("User not found");
        if (string.IsNullOrEmpty(userInfo.Name))
            throw new Exception("Name is empty");

        var user = _userRepository.GetById(userInfo.UserId);
        if (user == null)
            throw new Exception("User not exists");

        if (string.IsNullOrEmpty(userInfo.Email))
            throw new Exception("Email is empty");
        if (!EmailValidator.IsValidEmail(userInfo.Email))
            throw new Exception("Email is not valid");

        var userWithEmail = _userRepository.GetByEmail(userInfo.Email);
        if (userWithEmail != null && userWithEmail.UserId != user.UserId)
            throw new Exception("User with email already registered");

        user.Name = userInfo.Name;
        user.Email = userInfo.Email;
        user.Slug = userInfo.Slug;
        user.UpdatedAt = DateTime.Now;
        user.Slug = GenerateSlug(user);

        var updated = _userRepository.Update(user);
        return MapToDto(updated);
    }

    public UserInfo GetUserByEmail(string email)
    {
        var user = _userRepository.GetByEmail(email);
        return MapToDto(user);
    }

    public UserInfo GetUserByID(long userId)
    {
        var user = _userRepository.GetById(userId);
        return MapToDto(user);
    }

    public UserInfo GetUserByToken(string token)
    {
        var user = _userRepository.GetByToken(token);
        return MapToDto(user);
    }

    public UserInfo GetBySlug(string slug)
    {
        var user = _userRepository.GetBySlug(slug);
        return MapToDto(user);
    }

    public UserInfo GetUserInSession(HttpContext httpContext)
    {
        if (httpContext.User.Claims.Any())
        {
            return JsonConvert.DeserializeObject<UserInfo>(httpContext.User.Claims.First().Value);
        }
        return null;
    }

    public IList<UserInfo> ListUsers(int take)
    {
        return _userRepository.ListUsers(take).Select(MapToDto).ToList();
    }

    public string UpdateUserImage(Stream stream, long userId)
    {
        if (!(userId > 0))
            throw new Exception("Invalid User ID");

        var user = _userRepository.GetById(userId);
        if (user == null)
            throw new Exception("User not found");

        var fileName = $"user-{StringUtils.GenerateShortUniqueString()}.jpg";
        _imageAppService.UploadFile(stream, fileName);
        user.Image = fileName;
        _userRepository.Update(user);
        return fileName;
    }

    private string GenerateSlug(User user)
    {
        string newSlug;
        int c = 0;
        do
        {
            newSlug = SlugHelper.GerarSlug(!string.IsNullOrEmpty(user.Slug) ? user.Slug : user.Name);
            if (c > 0)
                newSlug += c.ToString();
            c++;
        } while (_userRepository.ExistSlug(user.UserId, newSlug));
        return newSlug;
    }

    private UserInfo MapToDto(User user)
    {
        if (user == null) return null;
        return new UserInfo
        {
            UserId = user.UserId,
            Hash = user.Hash,
            Slug = user.Slug,
            ImageUrl = _imageAppService.GetImageUrl(user.Image),
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    private static string GetUniqueToken()
    {
        using var crypto = RandomNumberGenerator.Create();
        int length = 100;
        string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_";
        byte[] data = new byte[length];
        byte[] buffer = null;
        int maxRandom = byte.MaxValue - ((byte.MaxValue + 1) % chars.Length);

        crypto.GetBytes(data);
        char[] result = new char[length];

        for (int i = 0; i < length; i++)
        {
            byte value = data[i];
            while (value > maxRandom)
            {
                if (buffer == null)
                    buffer = new byte[1];
                crypto.GetBytes(buffer);
                value = buffer[0];
            }
            result[i] = chars[value % chars.Length];
        }

        return new string(result);
    }
}
