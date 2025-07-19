package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private FarmerRepository farmerRepository;
    
    @Autowired
    private BuyerRepository buyerRepository;
    
    @Autowired
    private DriverRepository driverRepository;

    // Store verification codes temporarily (in production, use Redis or database)
    private Map<String, VerificationData> verificationCodes = new HashMap<>();
    
    private static class VerificationData {
        String code;
        String email;
        String userType;
        LocalDateTime expiryTime;
        Object userData;
        
        VerificationData(String code, String email, String userType, Object userData) {
            this.code = code;
            this.email = email;
            this.userType = userType;
            this.userData = userData;
            this.expiryTime = LocalDateTime.now().plusMinutes(15); // 15 minutes expiry
        }
        
        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryTime);
        }
    }
    
    /**
     * Generate and send email verification code
     */
    public boolean sendVerificationCode(String email, String userType, Object userData) {
        try {
            // Generate 6-digit verification code
            String verificationCode = String.format("%06d", new Random().nextInt(1000000));
            
            // Store verification data
            String key = email + "_" + userType;
            verificationCodes.put(key, new VerificationData(verificationCode, email, userType, userData));
            
            // Send email
            String subject = "CeyHarvest - Email Verification Code";
            String body = buildVerificationEmail(verificationCode, userType);
            
            emailService.sendEmail(email, subject, body);
            
            System.out.println("Verification code sent to: " + email + " (Code: " + verificationCode + ")");
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Verify email with code and complete registration
     */
    public Map<String, Object> verifyEmailAndCompleteRegistration(String email, String code, String userType) {
        String key = email + "_" + userType;
        VerificationData verificationData = verificationCodes.get(key);
        
        Map<String, Object> result = new HashMap<>();
        
        if (verificationData == null) {
            result.put("success", false);
            result.put("message", "No verification code found for this email");
            return result;
        }
        
        if (verificationData.isExpired()) {
            verificationCodes.remove(key);
            result.put("success", false);
            result.put("message", "Verification code has expired. Please request a new one");
            return result;
        }
        
        if (!verificationData.code.equals(code)) {
            result.put("success", false);
            result.put("message", "Invalid verification code");
            return result;
        }
        
        // Code is valid, complete registration
        try {
            Object savedUser = saveUserToDatabase(verificationData.userData, userType);
            verificationCodes.remove(key); // Clean up
            
            result.put("success", true);
            result.put("message", "Email verified successfully! Registration completed");
            result.put("user", savedUser);
            return result;
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Failed to complete registration: " + e.getMessage());
            return result;
        }
    }
    
    /**
     * Resend verification code
     */
    public boolean resendVerificationCode(String email, String userType) {
        String key = email + "_" + userType;
        VerificationData verificationData = verificationCodes.get(key);
        
        if (verificationData == null) {
            return false;
        }
        
        return sendVerificationCode(email, userType, verificationData.userData);
    }
    
    /**
     * Save user to appropriate repository based on type
     */
    private Object saveUserToDatabase(Object userData, String userType) {
        switch (userType.toUpperCase()) {
            case "FARMER":
                return farmerRepository.save((Farmer) userData);
            case "BUYER":
                return buyerRepository.save((Buyer) userData);
            case "DRIVER":
                return driverRepository.save((Driver) userData);
            case "ADMIN":
                return adminRepository.save((Admin) userData);
            default:
                throw new IllegalArgumentException("Unknown user type: " + userType);
        }
    }
    
    /**
     * Build verification email content
     */
    private String buildVerificationEmail(String code, String userType) {
        // Build HTML email with proper escaping
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 24px; }");
        html.append(".header h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: normal; }");
        html.append(".content { padding: 30px; }");
        html.append(".code-box { background: #f8f9fa; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }");
        html.append(".code { font-size: 36px; font-weight: bold; color: #10b981; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 10px 0; }");
        html.append(".footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; }");
        html.append(".warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }");
        html.append("ul { margin: 10px 0; padding-left: 20px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        
        // Header
        html.append("<div class=\"header\">");
        html.append("<h1>🌱 CeyHarvest</h1>");
        html.append("<h2>Email Verification Required</h2>");
        html.append("</div>");
        
        // Content
        html.append("<div class=\"content\">");
        html.append("<h3>Welcome to CeyHarvest!</h3>");
        html.append("<p>Thank you for registering as a <strong>").append(userType).append("</strong> on CeyHarvest - Sri Lanka's premier agricultural marketplace!</p>");
        html.append("<p>To complete your registration, please use the verification code below:</p>");
        
        // Code box
        html.append("<div class=\"code-box\">");
        html.append("<div class=\"code\">").append(code).append("</div>");
        html.append("<p><strong>Enter this code in the verification form</strong></p>");
        html.append("</div>");
        
        // Warning
        html.append("<div class=\"warning\">");
        html.append("<strong>⚠️ Important Security Information:</strong>");
        html.append("<ul>");
        html.append("<li>This code expires in <strong>15 minutes</strong></li>");
        html.append("<li>Do not share this code with anyone</li>");
        html.append("<li>If you didn't request this, please ignore this email</li>");
        html.append("</ul>");
        html.append("</div>");
        
        // Benefits
        html.append("<p><strong>Once verified, you'll be able to:</strong></p>");
        html.append("<ul>");
        html.append("<li>🌾 Access the full CeyHarvest platform</li>");
        html.append("<li>🛒 Connect with buyers and sellers</li>");
        html.append("<li>📱 Manage your agricultural business</li>");
        html.append("<li>🚚 Coordinate deliveries and logistics</li>");
        html.append("</ul>");
        html.append("<p>Welcome to the future of Sri Lankan agriculture!</p>");
        html.append("</div>");
        
        // Footer
        html.append("<div class=\"footer\">");
        html.append("<p><strong>CeyHarvest</strong> - Connecting Sri Lankan Agriculture<br>");
        html.append("This is an automated email, please do not reply.</p>");
        html.append("</div>");
        
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}
