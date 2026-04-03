using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NAuth.ACL.Interfaces;
using Viralt.Domain.Interfaces.Services;
using Viralt.DTO.Campaign;
using Viralt.DTO.Domain;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CampaignController : ControllerBase
{
    private readonly ICampaignService _campaignService;
    private readonly IWinnerService _winnerService;
    private readonly IUserClient _userClient;

    public CampaignController(
        ICampaignService campaignService,
        IWinnerService winnerService,
        IUserClient userClient)
    {
        _campaignService = campaignService;
        _winnerService = winnerService;
        _userClient = userClient;
    }

    [Authorize]
    [HttpPost("insert")]
    public IActionResult Insert([FromBody] CampaignInfo campaign)
    {
        try
        {
            if (campaign == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Campaign is empty" });

            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            campaign.UserId = userSession.UserId;
            var result = _campaignService.Insert(campaign);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpPost("update")]
    public IActionResult Update([FromBody] CampaignInfo campaign)
    {
        try
        {
            if (campaign == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Campaign is empty" });

            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var result = _campaignService.Update(campaign);
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

            _campaignService.Delete(id);
            return Ok(new StatusResult { Sucesso = true, Mensagem = "Campaign deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpPost("duplicate/{id}")]
    public IActionResult Duplicate(long id)
    {
        try
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var existing = _campaignService.GetById(id);
            if (existing == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Campaign not found" });

            existing.CampaignId = 0;
            existing.Title = existing.Title + " (Copy)";
            existing.Slug = null;
            existing.IsPublished = false;
            existing.TotalEntries = 0;
            existing.TotalParticipants = 0;
            existing.ViewCount = 0;
            existing.UserId = userSession.UserId;

            var result = _campaignService.Insert(existing);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpPost("draw/{id}")]
    public IActionResult Draw(long id, [FromBody] DrawRequest request)
    {
        try
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var winners = _winnerService.DrawWinners(id, request.WinnerCount, request.SelectionMethod);
            return Ok(new WinnerListResult
            {
                Sucesso = true,
                Mensagem = "Winners drawn successfully",
                Winners = winners.ToList()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
