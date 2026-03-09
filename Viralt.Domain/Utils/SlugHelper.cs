using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Viralt.Domain.Utils;

public static class SlugHelper
{
    public static string GerarSlug(string phrase)
    {
        string str = RemoveAccents(phrase).ToLower();
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", " ").Trim();
        str = str.Substring(0, str.Length <= 85 ? str.Length : 85).Trim();
        str = Regex.Replace(str, @"\s", "-");
        return str;
    }

    private static string RemoveAccents(string text)
    {
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}
