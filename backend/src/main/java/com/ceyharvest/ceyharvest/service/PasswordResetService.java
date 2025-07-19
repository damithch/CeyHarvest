package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private UnifiedAuthService unifiedAuthService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;

    public String createPasswordResetToken(String email) {
        // Check if user exists using unified auth service
        if (!unifiedAuthService.isEmailRegistered(email)) {
            throw new RuntimeException("User with email " + email + " not found");
        }

        // Invalidate any existing tokens for this email
        tokenRepository.deleteByEmail(email);

        // Generate new 6-digit numeric code
        Random random = new Random();
        String token = String.format("%06d", random.nextInt(1000000)); // Generates 000000 to 999999
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(15); // 15 minutes expiry for security

        PasswordResetToken resetToken = new PasswordResetToken(email, token, expiryDate);
        tokenRepository.save(resetToken);

        // Send email with reset token
        try {
            // Get user info for personalization
            String role = unifiedAuthService.findUserRoleByEmail(email);
            Object user = unifiedAuthService.getUserByEmailAndRole(email, role);
            String username = extractUsername(user, role);
            
            emailService.sendPasswordResetEmail(email, token, username);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            // Continue anyway - user can still use the token if provided through other means
        }

        return token;
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> resetTokenOpt = tokenRepository.findByTokenAndUsedFalse(token);
        
        if (resetTokenOpt.isEmpty()) {
            return false; // Token not found or already used
        }

        PasswordResetToken resetToken = resetTokenOpt.get();
        
        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            return false; // Token expired
        }

        // Reset password for the user
        boolean passwordReset = updateUserPassword(resetToken.getEmail(), newPassword);
        
        if (passwordReset) {
            // Mark token as used
            resetToken.setUsed(true);
            tokenRepository.save(resetToken);
        }

        return passwordReset;
    }

    private String extractUsername(Object user, String role) {
        if (user == null) return "User";
        
        try {
            switch (role.toUpperCase()) {
                case "ADMIN":
                    return ((Admin) user).getUsername();
                case "FARMER":
                    return ((Farmer) user).getUsername();
                case "BUYER":
                    return ((Buyer) user).getUsername();
                case "DRIVER":
                    return ((Driver) user).getUsername();
                default:
                    return "User";
            }
        } catch (Exception e) {
            return "User"; // Fallback if cast fails
        }
    }

    private boolean updateUserPassword(String email, String newPassword) {
        return unifiedAuthService.updatePassword(email, newPassword);
    }

    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}
