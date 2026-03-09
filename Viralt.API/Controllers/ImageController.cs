using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Viralt.Domain.Interfaces.Services;
using Viralt.DTO.Domain;
using Viralt.Infra.Interfaces.AppServices;

namespace Viralt.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ImageController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IImageAppService _imageAppService;

    public ImageController(
        IUserService userService,
        IImageAppService imageAppService)
    {
        _userService = userService;
        _imageAppService = imageAppService;
    }

    [Authorize]
    [HttpPost("uploadImageUser")]
    public ActionResult<StringResult> UploadImageUser(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var userSession = _userService.GetUserInSession(HttpContext);
            if (userSession == null)
                return StatusCode(401, "Not Authorized");

            var fileName = _userService.UpdateUserImage(file.OpenReadStream(), userSession.UserId);
            return new StringResult
            {
                Value = _imageAppService.GetImageUrl(fileName)
            };
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
