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
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .code-box { background: #fff; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                    .code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    .warning { background: #fef3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌱 CeyHarvest</h1>
                        <h2>Email Verification Required</h2>
                    </div>
                    <div class="content">
                        <h3>Welcome to CeyHarvest!</h3>
                        <p>Thank you for registering as a <strong>%s</strong> on CeyHarvest - Sri Lanka's premier agricultural marketplace!</p>
                        
                        <p>To complete your registration, please use the verification code below:</p>
                        
                        <div class="code-box">
                            <div class="code">%s</div>
                            <p>Enter this code in the verification form</p>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Important:</strong>
                            <ul>
                                <li>This code expires in <strong>15 minutes</strong></li>
                                <li>Do not share this code with anyone</li>
                                <li>If you didn't request this, please ignore this email</li>
                            </ul>
                        </div>
                        
                        <p>Once verified, you'll be able to:</p>
                        <ul>
                            <li>🌾 Access the full CeyHarvest platform</li>
                            <li>🛒 Connect with buyers and sellers</li>
                            <li>📱 Manage your agricultural business</li>
                            <li>🚚 Coordinate deliveries and logistics</li>
                        </ul>
                        
                        <p>Welcome to the future of Sri Lankan agriculture!</p>
                    </div>
                    <div class="footer">
                        <p>CeyHarvest - Connecting Sri Lankan Agriculture<br>
                        This is an automated email, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """, userType, code);
    }
}
