using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Domain;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ExternalController : ControllerBase
{
    private readonly IClientEntryRepository<ClientEntry> _clientEntryRepository;
    private readonly IClientService _clientService;
    private readonly string _apiKey;

    public ExternalController(
        IClientEntryRepository<ClientEntry> clientEntryRepository,
        IClientService clientService,
        IConfiguration configuration)
    {
        _clientEntryRepository = clientEntryRepository;
        _clientService = clientService;
        _apiKey = configuration["BazzucaMedia:ApiKey"];
    }

    [HttpPost("verify-entry")]
    public IActionResult VerifyEntry([FromBody] VerifyEntryRequest request)
    {
        try
        {
            if (!ValidateApiKey())
                return Unauthorized(new StatusResult { Sucesso = false, Mensagem = "Invalid API key" });

            if (request == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Request body is empty" });

            var clientEntries = _clientEntryRepository.ListByClient(request.ClientId);
            var clientEntry = clientEntries.FirstOrDefault(ce =>
                ce.EntryId == request.EntryId && ce.ClientId == request.ClientId);

            if (clientEntry == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Client entry not found" });

            clientEntry.Verified = request.Verified;
            clientEntry.VerificationData = request.VerificationData;
            _clientEntryRepository.Update(clientEntry);

            if (request.Verified)
            {
                var client = _clientService.GetById(clientEntry.ClientId);
                if (client != null)
                {
                    client.TotalEntries += clientEntry.EntriesEarned;
                    _clientService.Update(client);
                }
            }

            return Ok(new StatusResult { Sucesso = true, Mensagem = "Entry verified successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("bulk-verify")]
    public IActionResult BulkVerify([FromBody] List<VerifyEntryRequest> requests)
    {
        try
        {
            if (!ValidateApiKey())
                return Unauthorized(new StatusResult { Sucesso = false, Mensagem = "Invalid API key" });

            if (requests == null || !requests.Any())
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Request body is empty" });

            var results = new List<object>();

            foreach (var request in requests)
            {
                try
                {
                    var clientEntries = _clientEntryRepository.ListByClient(request.ClientId);
                    var clientEntry = clientEntries.FirstOrDefault(ce =>
                        ce.EntryId == request.EntryId && ce.ClientId == request.ClientId);

                    if (clientEntry == null)
                    {
                        results.Add(new { clientId = request.ClientId, entryId = request.EntryId, sucesso = false, mensagem = "Client entry not found" });
                        continue;
                    }

                    clientEntry.Verified = request.Verified;
                    clientEntry.VerificationData = request.VerificationData;
                    _clientEntryRepository.Update(clientEntry);

                    if (request.Verified)
                    {
                        var client = _clientService.GetById(clientEntry.ClientId);
                        if (client != null)
                        {
                            client.TotalEntries += clientEntry.EntriesEarned;
                            _clientService.Update(client);
                        }
                    }

                    results.Add(new { clientId = request.ClientId, entryId = request.EntryId, sucesso = true });
                }
                catch (Exception ex)
                {
                    results.Add(new { clientId = request.ClientId, entryId = request.EntryId, sucesso = false, mensagem = ex.Message });
                }
            }

            return Ok(new { sucesso = true, results });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    private bool ValidateApiKey()
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            return false;

        if (!Request.Headers.TryGetValue("X-BazzucaMedia-Key", out var headerValue))
            return false;

        return string.Equals(_apiKey, headerValue.ToString(), StringComparison.Ordinal);
    }
}

public class VerifyEntryRequest
{
    public long CampaignId { get; set; }
    public long ClientId { get; set; }
    public long EntryId { get; set; }
    public bool Verified { get; set; }
    public string VerificationData { get; set; }
}
