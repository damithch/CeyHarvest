package com.ceyharvest.ceyharvest.controller.buyer;

import com.ceyharvest.ceyharvest.document.Buyer;
import com.ceyharvest.ceyharvest.repository.BuyerRepository;
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
@RequestMapping("/api/buyer")
public class BuyerController {

    @Autowired
    private BuyerRepository buyerRepository;

    /**
     * Get buyer profile by email
     */
    @GetMapping("/profile/{email}")
    public ResponseEntity<?> getBuyerProfile(@PathVariable String email) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            // Check if user is trying to access their own profile or is an admin
            if (!currentUserEmail.equals(email) && !auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("Access denied. You can only view your own profile.");
            }
            
            Optional<Buyer> buyerOpt = buyerRepository.findByEmail(email);
            if (buyerOpt.isPresent()) {
                Buyer buyer = buyerOpt.get();
                
                // Create response without sensitive information
                Map<String, Object> response = new HashMap<>();
                response.put("id", buyer.getId());
                response.put("username", buyer.getUsername());
                response.put("email", buyer.getEmail());
                response.put("firstName", buyer.getFirstName());
                response.put("lastName", buyer.getLastName());
                response.put("phoneNumber", buyer.getPhoneNumber());
                response.put("address", buyer.getAddress());
                response.put("city", buyer.getCity());
                response.put("postalCode", buyer.getPostalCode());
                response.put("country", buyer.getCountry());
                response.put("role", buyer.getRole());
                response.put("createdAt", buyer.getCreatedAt());
                response.put("updatedAt", buyer.getUpdatedAt());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(404).body("Buyer not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving buyer profile: " + e.getMessage());
        }
    }

    /**
     * Update buyer profile
     */
    @PutMapping("/profile/{email}")
    public ResponseEntity<?> updateBuyerProfile(@PathVariable String email, @RequestBody Map<String, String> updates) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            // Check if user is trying to update their own profile
            if (!currentUserEmail.equals(email)) {
                return ResponseEntity.status(403).body("Access denied. You can only update your own profile.");
            }
            
            Optional<Buyer> buyerOpt = buyerRepository.findByEmail(email);
            if (buyerOpt.isPresent()) {
                Buyer buyer = buyerOpt.get();
                
                // Update allowed fields
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
                if (updates.containsKey("country")) {
                    buyer.setCountry(updates.get("country"));
                }
                
                // Update timestamp
                buyer.setUpdatedAt(LocalDateTime.now());
                
                // Save changes
                buyerRepository.save(buyer);
                
                return ResponseEntity.ok("Profile updated successfully");
            } else {
                return ResponseEntity.status(404).body("Buyer not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating buyer profile: " + e.getMessage());
        }
    }

    /**
     * Get current buyer profile (using JWT token)
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentBuyerProfile() {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            return getBuyerProfile(currentUserEmail);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving current buyer profile: " + e.getMessage());
        }
    }

    /**
     * Update current buyer profile (using JWT token)
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateCurrentBuyerProfile(@RequestBody Map<String, String> updates) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            return updateBuyerProfile(currentUserEmail, updates);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating current buyer profile: " + e.getMessage());
        }
    }
}
