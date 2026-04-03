using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Viralt.Domain.Interfaces.Services;
using Viralt.DTO.Domain;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class WinnerController : ControllerBase
{
    private readonly IWinnerService _winnerService;

    public WinnerController(IWinnerService winnerService)
    {
        _winnerService = winnerService;
    }

    [HttpPost("notify/{winnerId}")]
    public IActionResult NotifyWinner(long winnerId)
    {
        try
        {
            _winnerService.NotifyWinner(winnerId);
            return Ok(new StatusResult { Sucesso = true, Mensagem = "Winner notified successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("notifyall/{campaignId}")]
    public IActionResult NotifyAll(long campaignId)
    {
        try
        {
            _winnerService.NotifyAll(campaignId);
            return Ok(new StatusResult { Sucesso = true, Mensagem = "All winners notified successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
