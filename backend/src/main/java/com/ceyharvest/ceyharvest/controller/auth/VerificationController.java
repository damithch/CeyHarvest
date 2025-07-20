package com.ceyharvest.ceyharvest.controller.auth;

import com.ceyharvest.ceyharvest.dto.EmailVerificationDto;
import com.ceyharvest.ceyharvest.service.EmailVerificationService;
import com.ceyharvest.ceyharvest.util.JwtTokenUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    @Autowired
    private EmailVerificationService emailVerificationService;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    /**
     * Verify email with verification code
     */
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody EmailVerificationDto dto) {
        try {
            // Use userType if provided, otherwise fall back to determining from name
            String userType = (dto.getUserType() != null && !dto.getUserType().isEmpty()) 
                ? dto.getUserType() 
                : determineUserTypeFromName(dto.getName());
                
            Map<String, Object> result = emailVerificationService.verifyEmailAndCompleteRegistration(
                dto.getEmail(), 
                dto.getCode(), 
                userType
            );
            
            if ((Boolean) result.get("success")) {
                // Generate JWT token for the verified user
                Object user = result.get("user");
                String email = dto.getEmail();
                String userId = getUserId(user);
                
                String token = jwtTokenUtil.generateToken(email, userType, userId);
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", user);
                response.put("message", result.get("message"));
                response.put("role", userType);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(400).body(result.get("message"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Verification failed: " + e.getMessage());
        }
    }
    
    /**
     * Resend verification code
     */
    @PostMapping("/resend-code")
    public ResponseEntity<?> resendVerificationCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String userType = request.get("userType");
            
            if (email == null || userType == null) {
                return ResponseEntity.status(400).body("Email and user type are required");
            }
            
            boolean sent = emailVerificationService.resendVerificationCode(email, userType);
            
            if (sent) {
                return ResponseEntity.ok("Verification code resent successfully");
            } else {
                return ResponseEntity.status(400).body("Failed to resend verification code. Please try registering again.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to resend code: " + e.getMessage());
        }
    }
    
    /**
     * Check verification status
     */
    @GetMapping("/status")
    public ResponseEntity<?> checkVerificationStatus(@RequestParam String email, @RequestParam String userType) {
        // This could be enhanced to check if email is pending verification
        Map<String, String> response = new HashMap<>();
        response.put("email", email);
        response.put("userType", userType);
        response.put("status", "pending");
        return ResponseEntity.ok(response);
    }

    /**
     * Verify JWT token and return user details
     */
    @GetMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        try {
            if (jwtTokenUtil.isValidToken(token)) {
                String email = jwtTokenUtil.extractEmail(token);
                String role = jwtTokenUtil.extractRole(token);
                String userId = jwtTokenUtil.extractUserId(token);
                
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("email", email);
                response.put("role", role);
                response.put("userId", userId);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Invalid or expired token"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error verifying token: " + e.getMessage());
        }
    }
    
    /**
     * Helper method to determine user type from name parameter
     */
    private String determineUserTypeFromName(String name) {
        if (name == null) return "BUYER"; // Default to buyer
        
        String lowerName = name.toLowerCase();
        if (lowerName.contains("farmer")) return "FARMER";
        if (lowerName.contains("buyer")) return "BUYER";
        if (lowerName.contains("driver")) return "DRIVER";
        if (lowerName.contains("admin")) return "ADMIN";
        
        return "BUYER"; // Default fallback
    }
    
    /**
     * Helper method to extract user ID from user object
     */
    private String getUserId(Object user) {
        if (user instanceof com.ceyharvest.ceyharvest.document.Farmer) {
            return ((com.ceyharvest.ceyharvest.document.Farmer) user).getId();
        } else if (user instanceof com.ceyharvest.ceyharvest.document.Buyer) {
            return ((com.ceyharvest.ceyharvest.document.Buyer) user).getId();
        } else if (user instanceof com.ceyharvest.ceyharvest.document.Driver) {
            return ((com.ceyharvest.ceyharvest.document.Driver) user).getId();
        } else if (user instanceof com.ceyharvest.ceyharvest.document.Admin) {
            return ((com.ceyharvest.ceyharvest.document.Admin) user).getId();
        }
        return null;
    }
}
