using System.Text.Json.Serialization;

namespace Viralt.DTO.Campaign;

public class DrawRequest
{
    [JsonPropertyName("winnerCount")]
    public int WinnerCount { get; set; }

    [JsonPropertyName("selectionMethod")]
    public int SelectionMethod { get; set; }
}
