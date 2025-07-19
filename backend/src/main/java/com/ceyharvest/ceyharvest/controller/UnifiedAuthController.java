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
     * No need to specify role - system detects it automatically
     */
    @PostMapping("/login")
    public ResponseEntity<?> unifiedLogin(@Valid @RequestBody SecureLoginDTO dto) {
        try {
            Map<String, Object> loginResult = unifiedAuthService.attemptLogin(dto.getEmail(), dto.getPassword());
            
            if (loginResult != null) {
                return ResponseEntity.ok(loginResult);
            } else {
                return ResponseEntity.status(401).body("Invalid email or password");
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
