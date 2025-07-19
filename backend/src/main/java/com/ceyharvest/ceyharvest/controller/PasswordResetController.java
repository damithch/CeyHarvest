package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.document.Admin;
import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.document.Buyer;
import com.ceyharvest.ceyharvest.repository.AdminRepository;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import com.ceyharvest.ceyharvest.repository.BuyerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/reset")
public class PasswordResetController {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private FarmerRepository farmerRepository;
    
    @Autowired
    private BuyerRepository buyerRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Temporary endpoint to reset all passwords for testing
    @PostMapping("/all-passwords")
    public ResponseEntity<?> resetAllPasswords() {
        Map<String, String> resetPasswords = new HashMap<>();
        
        try {
            // Reset admin password
            Optional<Admin> adminOpt = adminRepository.findByEmail("admin@admin.gmail.com");
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                admin.setPassword(passwordEncoder.encode("CeyHarvest@2024"));
                adminRepository.save(admin);
                resetPasswords.put("admin@admin.gmail.com", "CeyHarvest@2024");
            }
            
            // Reset all farmer passwords to a default
            farmerRepository.findAll().forEach(farmer -> {
                farmer.setPassword(passwordEncoder.encode("farmer123"));
                farmerRepository.save(farmer);
                resetPasswords.put(farmer.getEmail(), "farmer123");
            });
            
            // Reset all buyer passwords to a default
            buyerRepository.findAll().forEach(buyer -> {
                buyer.setPassword(passwordEncoder.encode("buyer123"));
                buyerRepository.save(buyer);
                resetPasswords.put(buyer.getEmail(), "buyer123");
            });
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "All passwords have been reset and encrypted");
            response.put("accounts", resetPasswords);
            response.put("note", "This is for testing only - remove this endpoint in production");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error resetting passwords: " + e.getMessage());
        }
    }

    // Reset specific user password
    @PostMapping("/user/{email}")
    public ResponseEntity<?> resetUserPassword(@PathVariable String email, @RequestParam String newPassword) {
        try {
            // Check admin
            Optional<Admin> adminOpt = adminRepository.findByEmail(email);
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                admin.setPassword(passwordEncoder.encode(newPassword));
                adminRepository.save(admin);
                return ResponseEntity.ok("Admin password reset successfully");
            }
            
            // Check farmer
            Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
            if (farmerOpt.isPresent()) {
                Farmer farmer = farmerOpt.get();
                farmer.setPassword(passwordEncoder.encode(newPassword));
                farmerRepository.save(farmer);
                return ResponseEntity.ok("Farmer password reset successfully");
            }
            
            // Check buyer
            Optional<Buyer> buyerOpt = buyerRepository.findByEmail(email);
            if (buyerOpt.isPresent()) {
                Buyer buyer = buyerOpt.get();
                buyer.setPassword(passwordEncoder.encode(newPassword));
                buyerRepository.save(buyer);
                return ResponseEntity.ok("Buyer password reset successfully");
            }
            
            return ResponseEntity.status(404).body("User not found");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error resetting password: " + e.getMessage());
        }
    }
}
