using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NAuth.ACL.Interfaces;
using Viralt.Domain.Interfaces.Services;
using Viralt.DTO.Campaign;
using Viralt.DTO.Domain;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PrizeController : ControllerBase
{
    private readonly IPrizeService _prizeService;
    private readonly IUserClient _userClient;

    public PrizeController(
        IPrizeService prizeService,
        IUserClient userClient)
    {
        _prizeService = prizeService;
        _userClient = userClient;
    }

    [Authorize]
    [HttpPost("insert")]
    public IActionResult Insert([FromBody] PrizeInsertInfo dto)
    {
        try
        {
            if (dto == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Prize is empty" });

            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var result = _prizeService.Insert(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpPost("update")]
    public IActionResult Update([FromBody] PrizeUpdateInfo dto)
    {
        try
        {
            if (dto == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Prize is empty" });

            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var result = _prizeService.Update(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpDelete("delete/{id}")]
    public IActionResult Delete(long id)
    {
        try
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            _prizeService.Delete(id);
            return Ok(new StatusResult { Sucesso = true, Mensagem = "Prize deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
