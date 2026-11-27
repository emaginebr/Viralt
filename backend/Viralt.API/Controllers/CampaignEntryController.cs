using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NAuth.ACL.Interfaces;
using Viralt.Domain.Models;
using Viralt.DTO.Campaign;
using Viralt.DTO.Domain;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CampaignEntryController : ControllerBase
{
    private readonly ICampaignEntryRepository<CampaignEntry> _repository;
    private readonly IUserClient _userClient;

    public CampaignEntryController(
        ICampaignEntryRepository<CampaignEntry> repository,
        IUserClient userClient)
    {
        _repository = repository;
        _userClient = userClient;
    }

    [Authorize]
    [HttpPost("insert")]
    public IActionResult Insert([FromBody] CampaignEntryDefinitionInfo dto)
    {
        try
        {
            if (dto == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "CampaignEntry is empty" });

            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var model = MapToModel(dto);
            var saved = _repository.Insert(model);
            return Ok(MapToDto(saved));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpPost("update")]
    public IActionResult Update([FromBody] CampaignEntryDefinitionInfo dto)
    {
        try
        {
            if (dto == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "CampaignEntry is empty" });

            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var model = MapToModel(dto);
            var updated = _repository.Update(model);
            return Ok(MapToDto(updated));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [Authorize]
    [HttpPost("reorder")]
    public IActionResult Reorder([FromBody] List<CampaignEntryReorderInfo> items)
    {
        try
        {
            if (items == null || items.Count == 0)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "Reorder list is empty" });

            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            foreach (var item in items)
            {
                var existing = _repository.GetById(item.EntryId);
                if (existing != null)
                {
                    existing.SortOrder = item.SortOrder;
                    _repository.Update(existing);
                }
            }

            return Ok(new StatusResult { Sucesso = true, Mensagem = "Entries reordered successfully" });
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

            _repository.Delete(id);
            return Ok(new StatusResult { Sucesso = true, Mensagem = "CampaignEntry deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    private static CampaignEntryDefinitionInfo MapToDto(CampaignEntry model)
    {
        if (model == null) return null;
        return new CampaignEntryDefinitionInfo
        {
            EntryId = model.EntryId,
            CampaignId = model.CampaignId,
            EntryType = model.EntryType,
            Title = model.Title,
            Entries = model.Entries,
            Daily = model.Daily,
            Mandatory = model.Mandatory,
            EntryLabel = model.EntryLabel,
            EntryValue = model.EntryValue,
            SortOrder = model.SortOrder,
            Icon = model.Icon,
            Instructions = model.Instructions,
            RequireVerification = model.RequireVerification,
            TargetUrl = model.TargetUrl,
            ExternalProvider = model.ExternalProvider,
            ExternalEntryId = model.ExternalEntryId
        };
    }

    private static CampaignEntry MapToModel(CampaignEntryDefinitionInfo dto) => new()
    {
        EntryId = dto.EntryId,
        CampaignId = dto.CampaignId,
        EntryType = dto.EntryType,
        Title = dto.Title,
        Entries = dto.Entries,
        Daily = dto.Daily,
        Mandatory = dto.Mandatory,
        EntryLabel = dto.EntryLabel,
        EntryValue = dto.EntryValue,
        SortOrder = dto.SortOrder,
        Icon = dto.Icon,
        Instructions = dto.Instructions,
        RequireVerification = dto.RequireVerification,
        TargetUrl = dto.TargetUrl,
        ExternalProvider = dto.ExternalProvider,
        ExternalEntryId = dto.ExternalEntryId
    };
}
