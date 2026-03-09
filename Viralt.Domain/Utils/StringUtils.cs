namespace Viralt.Domain.Utils;

public static class StringUtils
{
    private static readonly char[] Base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".ToCharArray();

    public static string GenerateShortUniqueString()
    {
        var guid = Guid.NewGuid().ToByteArray();
        var result = new char[22];
        for (int i = 0; i < 22; i++)
        {
            result[i] = Base62Chars[guid[i % guid.Length] % 62];
        }
        return new string(result);
    }
}
