using Viralt.DTO.MailerSend;
using Viralt.Infra.Interfaces.AppServices;
using zTools.ACL.Interfaces;

namespace Viralt.Infra.AppServices;

public class MailerSendAppService : IMailerSendAppService
{
    private readonly IMailClient _mailClient;

    public MailerSendAppService(IMailClient mailClient)
    {
        _mailClient = mailClient;
    }

    public async Task<bool> SendMail(MailerInfo email)
    {
        var zToolsMail = new zTools.DTO.MailerSend.MailerInfo
        {
            From = new zTools.DTO.MailerSend.MailerRecipientInfo
            {
                Email = email.From.Email,
                Name = email.From.Name
            },
            To = email.To.Select(t => new zTools.DTO.MailerSend.MailerRecipientInfo
            {
                Email = t.Email,
                Name = t.Name
            }).ToList(),
            Subject = email.Subject,
            Text = email.Text,
            Html = email.Html
        };
        await _mailClient.SendmailAsync(zToolsMail);
        return true;
    }
}
