using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NAuth.ACL.Interfaces;
using NAuth.DTO.User;
using Viralt.DTO.Domain;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserClient _userClient;

    public UserController(IUserClient userClient)
    {
        _userClient = userClient;
    }

    [HttpPost("loginwithemail")]
    public async Task<ActionResult> LoginWithEmail([FromBody] LoginParam param)
    {
        try
        {
            var result = await _userClient.LoginWithEmailAsync(param);
            if (result == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Email or password is wrong" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("getme")]
    [Authorize]
    public IActionResult GetMe()
    {
        try
        {
            var user = _userClient.GetUserInSession(HttpContext);
            if (user == null)
                return Unauthorized("Not Authorized");

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("getbyemail/{email}")]
    public async Task<IActionResult> GetByEmail(string email)
    {
        try
        {
            var user = await _userClient.GetByEmailAsync(email);
            if (user == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "User with email not found" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("getBySlug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        try
        {
            var user = await _userClient.GetBySlugAsync(slug);
            if (user == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "User with slug not found" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("insert")]
    public async Task<IActionResult> Insert([FromBody] UserInsertedInfo user)
    {
        try
        {
            if (user == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "User is empty" });

            var newUser = await _userClient.InsertAsync(user);
            return Ok(newUser);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpPost("update")]
    public async Task<IActionResult> Update([FromBody] UserInfo user)
    {
        try
        {
            if (user == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "User is empty" });

            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            if (userSession.UserId != user.UserId)
                return StatusCode(403, "Only can update your own user");

            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "").Replace("Basic ", "");
            var updatedUser = await _userClient.UpdateAsync(user, token);
            return Ok(updatedUser);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpGet("haspassword")]
    public async Task<ActionResult<StatusResult>> HasPassword()
    {
        try
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "").Replace("Basic ", "");
            var hasPassword = await _userClient.HasPasswordAsync(token);
            return new StatusResult
            {
                Sucesso = hasPassword,
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
    public async Task<ActionResult<StatusResult>> ChangePassword([FromBody] ChangePasswordParam param)
    {
        try
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "").Replace("Basic ", "");
            var result = await _userClient.ChangePasswordAsync(param, token);
            return new StatusResult
            {
                Sucesso = result,
                Mensagem = result ? "Password changed successfully" : "Failed to change password"
            };
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
            var user = await _userClient.GetByEmailAsync(email);
            if (user == null)
                return new StatusResult { Sucesso = false, Mensagem = "Email not exist" };

            var result = await _userClient.SendRecoveryMailAsync(email);
            return new StatusResult { Sucesso = result, Mensagem = "Recovery email sent successfully" };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("changepasswordusinghash")]
    public async Task<ActionResult<StatusResult>> ChangePasswordUsingHash([FromBody] ChangePasswordUsingHashParam param)
    {
        try
        {
            var result = await _userClient.ChangePasswordUsingHashAsync(param);
            return new StatusResult
            {
                Sucesso = result,
                Mensagem = result ? "Password changed successfully" : "Failed to change password"
            };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("list/{take}")]
    public async Task<IActionResult> List(int take)
    {
        try
        {
            var users = await _userClient.ListAsync(take);
            return Ok(new { Sucesso = true, Users = users });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
