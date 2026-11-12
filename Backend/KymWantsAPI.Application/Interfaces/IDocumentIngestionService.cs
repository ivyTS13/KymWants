
namespace KymWantsAPI.Application.Interfaces
{
    public interface IDocumentIngestionService
    {
        Task<int> IngestOrUpdatePdfAsync(Stream pdfStream, string fileName);
    }
}
