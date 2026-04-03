using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Client;
using Viralt.DTO.Domain;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PublicController : ControllerBase
{
    private readonly IClientService _clientService;
    private readonly ICampaignService _campaignService;
    private readonly IReferralService _referralService;
    private readonly IClientEntryRepository<ClientEntry> _clientEntryRepository;
    private readonly ICampaignEntryRepository<CampaignEntry> _campaignEntryRepository;
    private readonly ICampaignViewRepository<CampaignView> _campaignViewRepository;
    private readonly ICampaignRepository<Campaign> _campaignRepository;
    private readonly ISubmissionService _submissionService;

    public PublicController(
        IClientService clientService,
        ICampaignService campaignService,
        IReferralService referralService,
        IClientEntryRepository<ClientEntry> clientEntryRepository,
        ICampaignEntryRepository<CampaignEntry> campaignEntryRepository,
        ICampaignViewRepository<CampaignView> campaignViewRepository,
        ICampaignRepository<Campaign> campaignRepository,
        ISubmissionService submissionService)
    {
        _clientService = clientService;
        _campaignService = campaignService;
        _referralService = referralService;
        _clientEntryRepository = clientEntryRepository;
        _campaignEntryRepository = campaignEntryRepository;
        _campaignViewRepository = campaignViewRepository;
        _campaignRepository = campaignRepository;
        _submissionService = submissionService;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (request == null)
                return Ok(new { sucesso = false, mensagem = "Request body is empty" });

            var campaign = _campaignService.GetBySlug(request.CampaignSlug);
            if (campaign == null)
                return Ok(new { sucesso = false, mensagem = "Campaign not found" });

            if (campaign.Status != 2)
                return Ok(new { sucesso = false, mensagem = "Campaign is not active" });

            var existing = _clientService.GetByEmail(campaign.CampaignId, request.Email);
            if (existing != null)
                return Ok(new { sucesso = false, mensagem = "Email already registered for this campaign" });

            // Resolve referral
            long? referredByClientId = null;
            if (!string.IsNullOrWhiteSpace(request.ReferralToken))
            {
                var referrer = _clientService.GetByToken(request.ReferralToken);
                if (referrer != null)
                    referredByClientId = referrer.ClientId;
            }

            var token = Guid.NewGuid().ToString("N");

            var clientDto = new Viralt.DTO.Client.ClientInfo
            {
                CampaignId = campaign.CampaignId,
                Token = token,
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Birthday = request.Birthday,
                Status = 1,
                ReferredByClientId = referredByClientId
            };

            var created = _clientService.Insert(clientDto);

            // Process referral: award bonus entries to referrer
            if (referredByClientId.HasValue)
            {
                var referrer = _clientService.GetById(referredByClientId.Value);
                if (referrer != null && referrer.CampaignId == campaign.CampaignId)
                {
                    const int bonusEntries = 1;
                    _referralService.CreateReferral(campaign.CampaignId, referrer.ClientId, created.ClientId, bonusEntries);
                }
            }

            return Ok(new
            {
                sucesso = true,
                token = created.Token,
                referralLink = created.ReferralToken,
                totalEntries = 0
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("complete-entry")]
    public IActionResult CompleteEntry([FromBody] CompleteEntryRequest request)
    {
        try
        {
            if (request == null)
                return Ok(new { sucesso = false, mensagem = "Request body is empty" });

            var client = _clientService.GetByToken(request.Token);
            if (client == null)
                return Ok(new { sucesso = false, mensagem = "Client not found" });

            var campaignEntry = _campaignEntryRepository.GetById(request.EntryId);
            if (campaignEntry == null)
                return Ok(new { sucesso = false, mensagem = "Entry not found" });

            // Check existing completions
            var clientEntries = _clientEntryRepository.ListByClient(client.ClientId);
            var existingEntry = clientEntries
                .Where(ce => ce.EntryId == request.EntryId)
                .OrderByDescending(ce => ce.CompletedAt)
                .FirstOrDefault();

            if (existingEntry != null)
            {
                if (!campaignEntry.Daily)
                    return Ok(new { sucesso = false, mensagem = "Entry already completed" });

                // Daily entry: check 24h cooldown
                if (existingEntry.CompletedAt.HasValue &&
                    existingEntry.CompletedAt.Value.AddHours(24) > DateTime.Now)
                    return Ok(new { sucesso = false, mensagem = "Daily entry can only be completed once every 24 hours" });
            }

            var newClientEntry = new ClientEntry
            {
                ClientId = client.ClientId,
                EntryId = request.EntryId,
                Status = 1,
                EntryValue = request.EntryValue,
                CompletedAt = DateTime.Now,
                EntriesEarned = campaignEntry.Entries,
                Verified = false
            };

            _clientEntryRepository.Insert(newClientEntry);

            // Update client total entries
            client.TotalEntries += campaignEntry.Entries;
            _clientService.Update(client);

            return Ok(new
            {
                sucesso = true,
                entriesEarned = campaignEntry.Entries,
                totalEntries = client.TotalEntries
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("track-view")]
    public IActionResult TrackView([FromBody] TrackViewRequest request)
    {
        try
        {
            if (request == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Request body is empty" });

            var campaign = _campaignService.GetBySlug(request.CampaignSlug);
            if (campaign == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Campaign not found" });

            var view = new CampaignView
            {
                CampaignId = campaign.CampaignId,
                ViewedAt = DateTime.Now,
                Referrer = request.Referrer
            };

            _campaignViewRepository.Insert(view);

            // Increment campaign view count
            campaign.ViewCount += 1;
            _campaignService.Update(campaign);

            return Ok(new StatusResult { Sucesso = true, Mensagem = "View tracked" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("submit")]
    public IActionResult Submit([FromBody] SubmitRequest request)
    {
        try
        {
            if (request == null)
                return Ok(new { sucesso = false, mensagem = "Request body is empty" });

            var client = _clientService.GetByToken(request.Token);
            if (client == null)
                return Ok(new { sucesso = false, mensagem = "Client not found" });

            var dto = new Viralt.DTO.Campaign.SubmissionInsertInfo
            {
                CampaignId = client.CampaignId,
                ClientId = client.ClientId,
                FileUrl = request.FileUrl,
                FileType = request.FileType,
                Caption = request.Caption
            };

            var result = _submissionService.Submit(dto);
            return Ok(new { sucesso = true, submission = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("vote/{submissionId}")]
    public IActionResult Vote(long submissionId)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var result = _submissionService.Vote(submissionId, ipAddress);
            if (result == null)
                return Ok(new { sucesso = false, mensagem = "Already voted or submission not found" });

            return Ok(new { sucesso = true, voteCount = result.VoteCount });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}

public class SubmitRequest
{
    public string Token { get; set; }
    public string FileUrl { get; set; }
    public int FileType { get; set; }
    public string Caption { get; set; }
}

public class RegisterRequest
{
    public string CampaignSlug { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public DateTime? Birthday { get; set; }
    public string ReferralToken { get; set; }
    public Dictionary<string, string> CustomFields { get; set; }
}

public class CompleteEntryRequest
{
    public string Token { get; set; }
    public long EntryId { get; set; }
    public string EntryValue { get; set; }
}

public class TrackViewRequest
{
    public string CampaignSlug { get; set; }
    public string Referrer { get; set; }
}
