using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Viralt.Domain.Interfaces.Services;
using Viralt.DTO.Domain;
using Viralt.DTO.User;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("gettokenauthorized")]
    public ActionResult<UserTokenResult> GetTokenAuthorized([FromBody] LoginParam login)
    {
        try
        {
            var token = _userService.LoginAndGenerateToken(login.Email, login.Password);
            if (token == null)
                return new UserTokenResult { Sucesso = false, Mensagem = "Email or password is wrong" };

            return new UserTokenResult { Token = token };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("getme")]
    [Authorize]
    public ActionResult<UserResult> GetMe()
    {
        try
        {
            var userSession = _userService.GetUserInSession(HttpContext);
            if (userSession == null)
                return StatusCode(401, "Not Authorized");

            var user = _userService.GetUserByID(userSession.UserId);
            if (user == null)
                return new UserResult { User = null, Sucesso = false, Mensagem = "User Not Found" };

            return new UserResult { User = user };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("getbyemail/{email}")]
    public ActionResult<UserResult> GetByEmail(string email)
    {
        try
        {
            var user = _userService.GetUserByEmail(email);
            if (user == null)
                return new UserResult { User = null, Sucesso = false, Mensagem = "User with email not found" };

            return new UserResult { User = user };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("getBySlug/{slug}")]
    public ActionResult<UserResult> GetBySlug(string slug)
    {
        try
        {
            var user = _userService.GetBySlug(slug);
            if (user == null)
                return new UserResult { User = null, Sucesso = false, Mensagem = "User with slug not found" };

            return new UserResult { User = user };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("insert")]
    public ActionResult<UserResult> Insert([FromBody] UserInfo user)
    {
        try
        {
            if (user == null)
                return new UserResult { User = null, Sucesso = false, Mensagem = "User is empty" };

            var newUser = _userService.Insert(user);
            return new UserResult { User = newUser };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpPost("update")]
    public ActionResult<UserResult> Update([FromBody] UserInfo user)
    {
        try
        {
            if (user == null)
                return new UserResult { User = null, Sucesso = false, Mensagem = "User is empty" };

            var userSession = _userService.GetUserInSession(HttpContext);
            if (userSession == null)
                return StatusCode(401, "Not Authorized");

            if (userSession.UserId != user.UserId)
                throw new Exception("Only can update your user");

            var updatedUser = _userService.Update(user);
            return new UserResult { User = updatedUser };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("loginwithemail")]
    public ActionResult<UserResult> LoginWithEmail([FromBody] LoginParam param)
    {
        try
        {
            var user = _userService.LoginWithEmail(param.Email, param.Password);
            if (user == null)
                return new UserResult { User = null, Sucesso = false, Mensagem = "Email or password is wrong" };

            return new UserResult { User = user };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpGet("haspassword")]
    public ActionResult<StatusResult> HasPassword()
    {
        try
        {
            var userSession = _userService.GetUserInSession(HttpContext);
            if (userSession == null)
                return StatusCode(401, "Not Authorized");

            var user = _userService.GetUserByID(userSession.UserId);
            if (user == null)
                return new UserResult { User = null, Sucesso = false, Mensagem = "User Not Found" };

            return new StatusResult
            {
                Sucesso = _userService.HasPassword(user.UserId),
                Mensagem = "Password verify successfully"
            };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpPost("changepassword")]
    public ActionResult<StatusResult> ChangePassword([FromBody] ChangePasswordParam param)
    {
        try
        {
            var userSession = _userService.GetUserInSession(HttpContext);
            if (userSession == null)
                return StatusCode(401, "Not Authorized");

            var user = _userService.GetUserByID(userSession.UserId);
            if (user == null)
                return new UserResult { User = null, Sucesso = false, Mensagem = "Email or password is wrong" };

            _userService.ChangePassword(user.UserId, param.OldPassword, param.NewPassword);
            return new StatusResult { Sucesso = true, Mensagem = "Password changed successfully" };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("sendrecoverymail/{email}")]
    public async Task<ActionResult<StatusResult>> SendRecoveryMail(string email)
    {
        try
        {
            var user = _userService.GetUserByEmail(email);
            if (user == null)
                return new StatusResult { Sucesso = false, Mensagem = "Email not exist" };

            await _userService.SendRecoveryEmail(email);
            return new StatusResult { Sucesso = true, Mensagem = "Recovery email sent successfully" };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("changepasswordusinghash")]
    public ActionResult<StatusResult> ChangePasswordUsingHash([FromBody] ChangePasswordUsingHashParam param)
    {
        try
        {
            _userService.ChangePasswordUsingHash(param.RecoveryHash, param.NewPassword);
            return new StatusResult { Sucesso = true, Mensagem = "Password changed successfully" };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("list/{take}")]
    public ActionResult<UserListResult> List(int take)
    {
        try
        {
            return new UserListResult
            {
                Sucesso = true,
                Users = _userService.ListUsers(take).ToList()
            };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
