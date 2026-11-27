using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Viralt.Domain.Interfaces.Services;
using Viralt.DTO.Client;
using Viralt.DTO.Domain;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ClientController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [Authorize]
    [HttpPost("disqualify/{id}")]
    public IActionResult Disqualify(long id)
    {
        try
        {
            var client = _clientService.GetById(id);
            if (client == null)
                return NotFound(new StatusResult { Sucesso = false, Mensagem = "Participante não encontrado" });

            client.IsDisqualified = true;
            _clientService.Update(client);

            return Ok(new StatusResult { Sucesso = true, Mensagem = "Participante desqualificado" });
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
            _clientService.Delete(id);
            return Ok(new StatusResult { Sucesso = true, Mensagem = "Participante excluído" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpGet("export/{campaignId}")]
    public IActionResult Export(long campaignId, [FromQuery] string format = "csv")
    {
        try
        {
            var clients = _clientService.ListByCampaign(campaignId);

            if (format.ToLower() == "json")
            {
                return Ok(clients);
            }

            var csv = new StringBuilder();
            csv.AppendLine("ClientId,Name,Email,Phone,Birthday,CreatedAt,TotalEntries,EmailVerified,IsWinner,IsDisqualified,ReferralToken,ReferredByClientId,IpAddress,CountryCode");

            foreach (var c in clients)
            {
                csv.AppendLine($"{c.ClientId},\"{c.Name}\",\"{c.Email}\",\"{c.Phone}\",{c.Birthday?.ToString("yyyy-MM-dd") ?? ""},\"{c.CreatedAt:yyyy-MM-dd HH:mm:ss}\",{c.TotalEntries},{c.EmailVerified},{c.IsWinner},{c.IsDisqualified},\"{c.ReferralToken}\",{c.ReferredByClientId?.ToString() ?? ""},\"{c.IpAddress}\",\"{c.CountryCode}\"");
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"participants-campaign-{campaignId}.csv");
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
