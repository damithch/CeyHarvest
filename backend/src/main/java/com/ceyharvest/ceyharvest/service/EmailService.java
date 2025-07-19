package com.ceyharvest.ceyharvest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@ceyharvest.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Send password reset email to user
     * @param toEmail The recipient email address
     * @param resetToken The 6-digit password reset code
     * @param username The username for personalization
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🌱 CeyHarvest Password Reset Code");
            
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "You have requested to reset your password for your CeyHarvest account.\n\n" +
                "Your 6-digit password reset code is: %s\n\n" +
                "Alternatively, you can click the link below to reset your password:\n" +
                "%s\n\n" +
                "This code will expire in 15 minutes for security reasons.\n\n" +
                "If you did not request this password reset, please ignore this email and your password will remain unchanged.\n\n" +
                "Best regards,\n" +
                "The CeyHarvest Team\n\n" +
                "---\n" +
                "This is an automated message, please do not reply to this email.",
                username,
                resetToken,
                resetLink
            );
            
            message.setText(emailBody);
            
            mailSender.send(message);
            
            System.out.println("Password reset code sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("Failed to send password reset email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Failed to send password reset email. Please try again later.");
        }
    }

    /**
     * Send welcome email to new admin
     * @param toEmail Admin email
     * @param username Admin username
     * @param temporaryPassword Temporary password
     */
    public void sendAdminWelcomeEmail(String toEmail, String username, String temporaryPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🌱 Welcome to CeyHarvest - Admin Account Created");
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Welcome to CeyHarvest! Your administrator account has been created.\n\n" +
                "Login Details:\n" +
                "Email: %s\n" +
                "Temporary Password: %s\n" +
                "Login URL: %s/login\n\n" +
                "🔒 IMPORTANT SECURITY NOTICE:\n" +
                "Please log in and change your password immediately for security reasons.\n" +
                "You can change your password in the admin dashboard or use the 'Forgot Password' option.\n\n" +
                "Your admin account has access to:\n" +
                "• User management (farmers, buyers, drivers)\n" +
                "• Product management and approval\n" +
                "• System configuration\n" +
                "• Reports and analytics\n\n" +
                "If you have any questions or need assistance, please contact the system administrator.\n\n" +
                "Best regards,\n" +
                "The CeyHarvest Development Team\n\n" +
                "---\n" +
                "This is an automated message, please do not reply to this email.",
                username,
                toEmail,
                temporaryPassword,
                frontendUrl
            );
            
            message.setText(emailBody);
            
            mailSender.send(message);
            
            System.out.println("Welcome email sent successfully to admin: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to admin " + toEmail + ": " + e.getMessage());
            // Don't throw exception for welcome emails - admin account should still be created
        }
    }

    /**
     * Test email connectivity
     * @return true if email service is working
     */
    public boolean testEmailService() {
        try {
            // Try to get the mail sender configuration
            mailSender.createMimeMessage();
            return true;
        } catch (Exception e) {
            System.err.println("Email service test failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Generic method to send email
     * @param toEmail The recipient email address
     * @param subject The email subject
     * @param body The email body content
     */
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
