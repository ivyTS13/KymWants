using Imagekit;
using Imagekit.Models.Files;
using KymWantsAPI.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace KymWantsAPI.Infrastructure.Services
{
    public class ImageKitStorageService : IImageStorageService
    {
        private readonly ImageKitClient _imageKit;

        public ImageKitStorageService(IConfiguration configuration)
        {
            var config = configuration.GetSection("ImageKit");

            var privateKey = config["PrivateKey"];

            if (string.IsNullOrWhiteSpace(privateKey))
            {
                throw new InvalidOperationException(
                    "ImageKit:PrivateKey is missing from configuration.");
            }

            _imageKit = new ImageKitClient
            {
                PrivateKey = privateKey
            };
        }

        public async Task<string> UploadImageAsync(
            IFormFile file,
            string fileName,
            string folder,
            List<string>? tags = null)
        {
            using var stream = file.OpenReadStream();

            var parameters = new FileUploadParams
            {
                File = stream,
                FileName = fileName,
                Folder = folder,
                Tags = tags
            };

            var response = await _imageKit.Files.Upload(parameters);

            if (string.IsNullOrWhiteSpace(response.Url))
            {
                throw new InvalidOperationException(
                    "ImageKit did not return a valid URL after upload.");
            }

            return response.Url;
        }
    }
}