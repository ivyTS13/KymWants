using KymWantsAPI.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;

namespace KymWantsAPI.Infrastructure.Services
{
    public class ResendEmailService : IEmailService
    {
        private readonly IResend _resend;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ResendEmailService> _logger;

        public ResendEmailService(
            IResend resend,
            IConfiguration config,
            ILogger<ResendEmailService> logger)
        {
            _resend = resend;
            _configuration = config;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken)
        {
            try
            {
                var frontendUrl = _configuration["Frontend:RedirectUrl"] ?? "http://localhost:3000";
                var resetLink = $"{frontendUrl}/reset-password?token={resetToken}";
                var fromEmail = _configuration["Resend:FromEmail"] ?? "onboarding@resend.dev";

                // We use single quotes (' ') inside the HTML so we don't have to escape double quotes (" ") in C#
                var message = new EmailMessage
                {
                    From = fromEmail,
                    To = { toEmail },
                    Subject = "Reset your KymWants password",
                    HtmlBody = $@"
                    <div style='background-color: #eee0cc; padding: 40px 20px; font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; text-align: center;'>
                        <div style='max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px 30px; border-radius: 16px; border-top: 8px solid #ba6a4c; box-shadow: 0 4px 15px rgba(0,0,0,0.05);'>
                            
                            <!-- Logo -->
<img src=""https://ik.imagekit.io/1aqjeq8hg/kymthoeay@2x.png"" 
     alt=""KymWants Logo"" 
     width=""100"" 
     height=""100"" 
     style=""display:block; margin:0 auto 20px auto;"" />

                            <h2 style='color: #7b2525; margin-top: 0; font-size: 24px;'>Reset Your Password</h2>
                            
                            <p style='color: #607456; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                                We received a request to reset the password for your KymWants account. 
                                Click the button below to choose a new one.
                            </p>
                            
                            <a href='{resetLink}' style='display: inline-block; background-color: #ba6a4c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; margin-bottom: 25px;'>
                                Reset Password
                            </a>
                            
                            <hr style='border: none; border-top: 1px solid #eee0cc; margin: 20px 0;'>
                            
                            <p style='color: #607456; font-size: 13px; line-height: 1.5; margin: 0; opacity: 0.8;'>
                                This link will expire in 1 hour.<br>
                                If you didn't request this, you can safely ignore this email.
                            </p>
                        </div>
                    </div>"
                };

                await _resend.EmailSendAsync(message);
                _logger.LogInformation("Password reset email successfully sent to {Email}", toEmail);
            }

            catch (ResendException ex)
            {
                _logger.LogError(ex, "Resend API failed to send password reset email to {Email}", toEmail);
                throw new InvalidOperationException("Email service provider error. Unable to send reset email.", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error sending password reset email to {Email}", toEmail);
                throw;
            }
        }
    }
}