package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.dto.SecureLoginDTO;
import com.ceyharvest.ceyharvest.service.UnifiedAuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UnifiedAuthController {

    @Autowired
    private UnifiedAuthService unifiedAuthService;

    /**
     * Unified login endpoint that works for all user types
     * Accepts both email and phone number as identifier
     */
    @PostMapping("/login")
    public ResponseEntity<?> unifiedLogin(@RequestBody Map<String, String> loginData) {
        try {
            String identifier = loginData.get("identifier"); // Can be email or phone
            String password = loginData.get("password");
            
            if (identifier == null || password == null) {
                return ResponseEntity.status(400).body("Identifier and password are required");
            }
            
            Map<String, Object> loginResult = unifiedAuthService.attemptLoginWithIdentifier(identifier, password);
            
            if (loginResult != null) {
                return ResponseEntity.ok(loginResult);
            } else {
                return ResponseEntity.status(401).body("Invalid email/phone or password");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
        }
    }

    /**
     * Check if email is already registered
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        try {
            String role = unifiedAuthService.findUserRoleByEmail(email);
            if (role != null) {
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "role", role
                ));
            } else {
                return ResponseEntity.ok(Map.of("exists", false));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error checking email: " + e.getMessage());
        }
    }

    /**
     * Get user role by email
     */
    @GetMapping("/user-role")
    public ResponseEntity<?> getUserRole(@RequestParam String email) {
        try {
            String role = unifiedAuthService.findUserRoleByEmail(email);
            if (role != null) {
                return ResponseEntity.ok(Map.of("role", role));
            } else {
                return ResponseEntity.status(404).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting user role: " + e.getMessage());
        }
    }
}
