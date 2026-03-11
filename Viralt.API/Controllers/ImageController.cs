using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NAuth.ACL.Interfaces;
using Viralt.DTO.Domain;
using Viralt.Infra.Interfaces.AppServices;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ImageController : ControllerBase
{
    private readonly IUserClient _userClient;
    private readonly IImageAppService _imageAppService;

    public ImageController(
        IUserClient userClient,
        IImageAppService imageAppService)
    {
        _userClient = userClient;
        _imageAppService = imageAppService;
    }

    [Authorize]
    [HttpPost("uploadImageUser")]
    public async Task<ActionResult<StringResult>> UploadImageUser(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var userSession = _userClient.GetUserInSession(HttpContext);
            if (userSession == null)
                return Unauthorized("Not Authorized");

            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "").Replace("Basic ", "");
            var fileName = await _userClient.UploadImageUserAsync(file.OpenReadStream(), file.FileName, token);
            return new StringResult
            {
                Value = fileName
            };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
