namespace Viralt.Domain.Models;

public class User
{
    public long UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Slug { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public int? Plan { get; set; }
    public string Token { get; set; }
    public string RecoveryHash { get; set; }
    public int Status { get; set; }
    public string Hash { get; set; }
    public string Image { get; set; }

    public virtual ICollection<Campaign> Campaigns { get; set; } = new List<Campaign>();

    public string CreateMD5(string input)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
        byte[] hashBytes = md5.ComputeHash(inputBytes);
        return Convert.ToHexString(hashBytes);
    }

    public string EncryptPassword(string password)
    {
        return CreateMD5(Hash + "|" + password);
    }

    public string GenerateNewToken()
    {
        return CreateMD5(Guid.NewGuid().ToString());
    }

    public string GenerateRecoveryHash()
    {
        return CreateMD5(Hash + "|" + Guid.NewGuid().ToString());
    }
}
