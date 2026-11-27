namespace Viralt.DTO.Settings
{
    public class MailerSendSetting
    {
        public string ApiToken { get; set; } = string.Empty;
        public string FromEmail { get; set; } = "noreply@viralt.com";
        public string FromName { get; set; } = "Viralt";
        public string ApiUrl { get; set; } = "https://api.mailersend.com/v1/";
    }
}
