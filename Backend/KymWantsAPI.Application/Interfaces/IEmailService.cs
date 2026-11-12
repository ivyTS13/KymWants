namespace KymWantsAPI.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string resetToken, CancellationToken cancellationToken = default);
    }
}
