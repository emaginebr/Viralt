namespace Viralt.Infra.Interfaces.AppServices;

public interface IImageAppService
{
    string GetImageUrl(string fileName);
    string UploadFile(Stream stream, string fileName);
}
