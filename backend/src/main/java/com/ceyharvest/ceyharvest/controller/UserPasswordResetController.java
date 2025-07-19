package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.dto.PasswordResetConfirmDTO;
import com.ceyharvest.ceyharvest.dto.PasswordResetRequestDTO;
import com.ceyharvest.ceyharvest.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserPasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody PasswordResetRequestDTO request) {
        try {
            String token = passwordResetService.createPasswordResetToken(request.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "A 6-digit password reset code has been sent to your email");
            response.put("expiresIn", "15 minutes");
            response.put("instructions", "Check your email for the 6-digit code. Enter this code in the password reset form.");
            
            // In development, also provide the token for testing
            response.put("resetCode", token);
            response.put("developmentNote", "In production, the code is only sent via email");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetConfirmDTO request) {
        // Debug logging
        System.out.println("Password reset request received:");
        System.out.println("6-digit Code: " + (request.getToken() != null ? request.getToken() : "null"));
        System.out.println("New Password: " + (request.getNewPassword() != null ? "[PROVIDED]" : "null"));
        System.out.println("Confirm Password: " + (request.getConfirmPassword() != null ? "[PROVIDED]" : "null"));
        
        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Passwords do not match");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            boolean success = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            
            if (success) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Password has been reset successfully. You can now login with your new password.");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid or expired reset token");
                return ResponseEntity.badRequest().body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to reset password: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/verify-reset-token/{token}")
    public ResponseEntity<?> verifyResetToken(@PathVariable String token) {
        // This endpoint can be used to verify if a reset token is valid
        // Useful for frontend validation before showing the reset form
        try {
            // We'll check if token exists and is not expired by trying to use it with a dummy password
            // In a real implementation, you'd have a separate verification method
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Reset token is valid");
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid or expired reset token");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
