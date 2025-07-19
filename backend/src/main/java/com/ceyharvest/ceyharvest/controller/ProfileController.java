package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
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

        driverRepository.save(driver);
        return ResponseEntity.ok("Driver profile updated successfully");
    }
}
