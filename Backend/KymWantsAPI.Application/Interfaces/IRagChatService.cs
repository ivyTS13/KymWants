

using KymWantsAPI.Application.DTOs;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IRagChatService
    {
        Task<ChatResponseDto> AskAsync(string question, string clientKey);
    }
}
