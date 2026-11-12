

namespace KymWantsAPI.Application.DTOs
{
    public record ChatRequestDto(string Question);

    public class ChatResponseDto
    {
        public string Answer { get; set; } = string.Empty;
        public List<string> Sources { get; set; } = new();
        public int TokensUsed { get; set; }
    }
}
