using Viralt.DTO.MailerSend;

namespace Viralt.Infra.Interfaces.AppServices;

public interface IMailerSendAppService
{
    Task<bool> SendMail(MailerInfo email);
}
