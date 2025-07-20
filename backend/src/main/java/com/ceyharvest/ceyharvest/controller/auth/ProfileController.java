package com.ceyharvest.ceyharvest.controller.auth;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private FarmerRepository farmerRepository;
    
    @Autowired
    private BuyerRepository buyerRepository;
    
    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Unified profile update endpoint for all user types
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            if (currentUserEmail == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            // Try to find user in each repository and update accordingly
            // Check Admin
            Optional<Admin> adminOpt = adminRepository.findByEmail(currentUserEmail);
            if (adminOpt.isPresent()) {
                return updateAdminProfile(adminOpt.get(), updates);
            }

            // Check Farmer
            Optional<Farmer> farmerOpt = farmerRepository.findByEmail(currentUserEmail);
            if (farmerOpt.isPresent()) {
                return updateFarmerProfile(farmerOpt.get(), updates);
            }

            // Check Buyer
            Optional<Buyer> buyerOpt = buyerRepository.findByEmail(currentUserEmail);
            if (buyerOpt.isPresent()) {
                return updateBuyerProfile(buyerOpt.get(), updates);
            }

            // Check Driver
            Optional<Driver> driverOpt = driverRepository.findByEmail(currentUserEmail);
            if (driverOpt.isPresent()) {
                return updateDriverProfile(driverOpt.get(), updates);
            }

            return ResponseEntity.status(404).body("User not found");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating profile: " + e.getMessage());
        }
    }

    /**
     * Unified password change endpoint for all user types
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            System.out.println("=== PASSWORD CHANGE DEBUG ===");
            System.out.println("Current user email: " + currentUserEmail);
            System.out.println("Password data keys: " + passwordData.keySet());
            
            if (currentUserEmail == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Current password and new password are required"));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.status(400).body(Map.of("error", "New password must be at least 6 characters long"));
            }

            // Try to find user in each repository and change password accordingly
            // Check Admin
            Optional<Admin> adminOpt = adminRepository.findByEmail(currentUserEmail);
            if (adminOpt.isPresent()) {
                System.out.println("Found admin user");
                return changeAdminPassword(adminOpt.get(), currentPassword, newPassword);
            }

            // Check Farmer
            Optional<Farmer> farmerOpt = farmerRepository.findByEmail(currentUserEmail);
            if (farmerOpt.isPresent()) {
                System.out.println("Found farmer user");
                return changeFarmerPassword(farmerOpt.get(), currentPassword, newPassword);
            }

            // Check Buyer
            Optional<Buyer> buyerOpt = buyerRepository.findByEmail(currentUserEmail);
            if (buyerOpt.isPresent()) {
                System.out.println("Found buyer user");
                return changeBuyerPassword(buyerOpt.get(), currentPassword, newPassword);
            }

            // Check Driver
            Optional<Driver> driverOpt = driverRepository.findByEmail(currentUserEmail);
            if (driverOpt.isPresent()) {
                System.out.println("Found driver user");
                return changeDriverPassword(driverOpt.get(), currentPassword, newPassword);
            }

            System.out.println("User not found in any repository");
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));

        } catch (Exception e) {
            System.out.println("Exception in password change: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error changing password: " + e.getMessage()));
        }
    }

    private ResponseEntity<?> updateAdminProfile(Admin admin, Map<String, String> updates) {
        // Admin only has basic fields: username, password, email, role
        // Only allow username updates for admins
        if (updates.containsKey("username")) {
            admin.setUsername(updates.get("username"));
        }

        adminRepository.save(admin);
        return ResponseEntity.ok("Admin profile updated successfully");
    }

    private ResponseEntity<?> updateFarmerProfile(Farmer farmer, Map<String, String> updates) {
        // Update allowed fields for farmer
        if (updates.containsKey("firstName")) {
            farmer.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            farmer.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("phoneNumber")) {
            farmer.setPhoneNumber(updates.get("phoneNumber"));
        }
        if (updates.containsKey("address")) {
            farmer.setAddress(updates.get("address"));
        }
        if (updates.containsKey("city")) {
            farmer.setCity(updates.get("city"));
        }
        if (updates.containsKey("postalCode")) {
            farmer.setPostalCode(updates.get("postalCode"));
        }

        farmer.setUpdatedAt(LocalDateTime.now());
        farmerRepository.save(farmer);
        return ResponseEntity.ok("Farmer profile updated successfully");
    }

    private ResponseEntity<?> updateBuyerProfile(Buyer buyer, Map<String, String> updates) {
        // Update allowed fields for buyer
        if (updates.containsKey("firstName")) {
            buyer.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            buyer.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("phoneNumber")) {
            buyer.setPhoneNumber(updates.get("phoneNumber"));
        }
        if (updates.containsKey("address")) {
            buyer.setAddress(updates.get("address"));
        }
        if (updates.containsKey("city")) {
            buyer.setCity(updates.get("city"));
        }
        if (updates.containsKey("postalCode")) {
            buyer.setPostalCode(updates.get("postalCode"));
        }

        // Update timestamp if available
        if (buyer instanceof Object) { // Check if has setUpdatedAt method
            try {
                buyer.setUpdatedAt(LocalDateTime.now());
            } catch (Exception e) {
                // Ignore if method doesn't exist
            }
        }

        buyerRepository.save(buyer);
        return ResponseEntity.ok("Buyer profile updated successfully");
    }

    private ResponseEntity<?> updateDriverProfile(Driver driver, Map<String, String> updates) {
        // Update allowed fields for driver
        if (updates.containsKey("firstName")) {
            driver.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            driver.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("phoneNumber")) {
            driver.setPhoneNumber(updates.get("phoneNumber"));
        }
        if (updates.containsKey("address")) {
            driver.setAddress(updates.get("address"));
        }
        if (updates.containsKey("city")) {
            driver.setCity(updates.get("city"));
        }
        if (updates.containsKey("postalCode")) {
            driver.setPostalCode(updates.get("postalCode"));
        }

        driver.setUpdatedAt(LocalDateTime.now());
        driverRepository.save(driver);
        return ResponseEntity.ok("Driver profile updated successfully");
    }

    // Password change helper methods
    private ResponseEntity<?> changeAdminPassword(Admin admin, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("error", "Current password is incorrect"));
        }
        admin.setPassword(passwordEncoder.encode(newPassword));
        admin.setPasswordChangedFromDefault(true); // Mark that password has been changed from default
        adminRepository.save(admin);
        return ResponseEntity.ok(Map.of("message", "Admin password changed successfully"));
    }

    private ResponseEntity<?> changeFarmerPassword(Farmer farmer, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, farmer.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("error", "Current password is incorrect"));
        }
        farmer.setPassword(passwordEncoder.encode(newPassword));
        farmerRepository.save(farmer);
        return ResponseEntity.ok(Map.of("message", "Farmer password changed successfully"));
    }

    private ResponseEntity<?> changeBuyerPassword(Buyer buyer, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, buyer.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("error", "Current password is incorrect"));
        }
        buyer.setPassword(passwordEncoder.encode(newPassword));
        buyerRepository.save(buyer);
        return ResponseEntity.ok(Map.of("message", "Buyer password changed successfully"));
    }

    private ResponseEntity<?> changeDriverPassword(Driver driver, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, driver.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("error", "Current password is incorrect"));
        }
        driver.setPassword(passwordEncoder.encode(newPassword));
        driverRepository.save(driver);
        return ResponseEntity.ok(Map.of("message", "Driver password changed successfully"));
    }
}
