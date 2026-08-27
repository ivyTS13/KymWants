

using Microsoft.AspNetCore.Http;

namespace KymWantsAPI.Application.Interfaces
{
    public interface IImageStorageService
    {
        Task<string> UploadImageAsync(IFormFile file, string fileName, string folder, List<string>? tags = null);
    }
}