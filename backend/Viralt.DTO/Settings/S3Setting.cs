namespace Viralt.DTO.Settings
{
    public class S3Setting
    {
        public string BucketName { get; set; } = "emagine";
        public string Prefix { get; set; } = "viralt/";
        public string Region { get; set; } = string.Empty;
        public string ServiceUrl { get; set; } = string.Empty;
        public string PublicBaseUrl { get; set; } = string.Empty;
        public string AccessKey { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
    }
}
