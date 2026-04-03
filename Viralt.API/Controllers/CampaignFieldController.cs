using System;
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
public class CampaignFieldController : ControllerBase
{
    private readonly ICampaignFieldRepository<CampaignField> _repository;
    private readonly IUserClient _userClient;

    public CampaignFieldController(
        ICampaignFieldRepository<CampaignField> repository,
        IUserClient userClient)
    {
        _repository = repository;
        _userClient = userClient;
    }

    [Authorize]
    [HttpPost("insert")]
    public IActionResult Insert([FromBody] CampaignFieldInfo dto)
    {
        try
        {
            if (dto == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "CampaignField is empty" });

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
    public IActionResult Update([FromBody] CampaignFieldInfo dto)
    {
        try
        {
            if (dto == null)
                return Ok(new StatusResult { Sucesso = false, Mensagem = "CampaignField is empty" });

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
    [HttpDelete("delete/{id}")]
    public IActionResult Delete(long id)
    {
        try
        {
            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            _repository.Delete(id);
            return Ok(new StatusResult { Sucesso = true, Mensagem = "CampaignField deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    private static CampaignFieldInfo MapToDto(CampaignField model)
    {
        if (model == null) return null;
        return new CampaignFieldInfo
        {
            FieldId = model.FieldId,
            CampaignId = model.CampaignId,
            FieldType = model.FieldType,
            Title = model.Title,
            Required = model.Required
        };
    }

    private static CampaignField MapToModel(CampaignFieldInfo dto) => new()
    {
        FieldId = dto.FieldId,
        CampaignId = dto.CampaignId,
        FieldType = dto.FieldType,
        Title = dto.Title,
        Required = dto.Required
    };
}
