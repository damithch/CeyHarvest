package com.ceyharvest.ceyharvest.controller.driver;

import com.ceyharvest.ceyharvest.document.Driver;
import com.ceyharvest.ceyharvest.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;

    /**
     * Get driver profile by ID
     */
    @GetMapping("/profile/{driverId}")
    public ResponseEntity<?> getDriverProfile(@PathVariable String driverId) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            Optional<Driver> driverOpt = driverRepository.findById(driverId);
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                
                // Check if user is trying to access their own profile or is an admin
                if (!currentUserEmail.equals(driver.getEmail()) && !auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                    return ResponseEntity.status(403).body("Access denied. You can only view your own profile.");
                }
                
                // Create response without sensitive information
                Map<String, Object> response = new HashMap<>();
                response.put("id", driver.getId());
                response.put("username", driver.getUsername());
                response.put("email", driver.getEmail());
                response.put("firstName", driver.getFirstName());
                response.put("lastName", driver.getLastName());
                response.put("phoneNumber", driver.getPhoneNumber());
                response.put("address", driver.getAddress());
                response.put("city", driver.getCity());
                response.put("postalCode", driver.getPostalCode());
                response.put("role", driver.getRole());
                response.put("createdAt", driver.getCreatedAt());
                response.put("updatedAt", driver.getUpdatedAt());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(404).body("Driver not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving driver profile: " + e.getMessage());
        }
    }

    /**
     * Get driver deliveries (placeholder - would need actual Delivery entity)
     */
    @GetMapping("/{driverId}/deliveries")
    public ResponseEntity<?> getDriverDeliveries(@PathVariable String driverId) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            Optional<Driver> driverOpt = driverRepository.findById(driverId);
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                
                // Check if user is trying to access their own deliveries or is an admin
                if (!currentUserEmail.equals(driver.getEmail()) && !auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                    return ResponseEntity.status(403).body("Access denied.");
                }
                
                // For now, return empty array - would need actual Delivery entity and repository
                List<Map<String, Object>> deliveries = new ArrayList<>();
                
                // TODO: Implement actual delivery fetching when Delivery entity is created
                // Example placeholder data:
                Map<String, Object> sampleDelivery = new HashMap<>();
                sampleDelivery.put("id", "sample-delivery-1");
                sampleDelivery.put("pickupAddress", "123 Farm Road, Colombo");
                sampleDelivery.put("deliveryAddress", "456 Market Street, Kandy");
                sampleDelivery.put("status", "PENDING");
                sampleDelivery.put("deliveryFee", 500.0);
                sampleDelivery.put("items", Arrays.asList("Vegetables", "Fruits"));
                deliveries.add(sampleDelivery);
                
                return ResponseEntity.ok(deliveries);
            } else {
                return ResponseEntity.status(404).body("Driver not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving deliveries: " + e.getMessage());
        }
    }

    /**
     * Get driver statistics
     */
    @GetMapping("/{driverId}/stats")
    public ResponseEntity<?> getDriverStats(@PathVariable String driverId) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            Optional<Driver> driverOpt = driverRepository.findById(driverId);
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                
                // Check if user is trying to access their own stats or is an admin
                if (!currentUserEmail.equals(driver.getEmail()) && !auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                    return ResponseEntity.status(403).body("Access denied.");
                }
                
                // For now, return placeholder stats - would calculate from actual deliveries
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalDeliveries", 15);
                stats.put("completedDeliveries", 12);
                stats.put("pendingDeliveries", 3);
                stats.put("totalEarnings", 7500.0);
                
                return ResponseEntity.ok(stats);
            } else {
                return ResponseEntity.status(404).body("Driver not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving driver stats: " + e.getMessage());
        }
    }

    /**
     * Update delivery status (placeholder)
     */
    @PutMapping("/{driverId}/deliveries/{deliveryId}/status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable String driverId,
            @PathVariable String deliveryId,
            @RequestBody Map<String, String> request) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            Optional<Driver> driverOpt = driverRepository.findById(driverId);
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                
                // Check if user is trying to update their own delivery or is an admin
                if (!currentUserEmail.equals(driver.getEmail()) && !auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                    return ResponseEntity.status(403).body("Access denied.");
                }
                
                String newStatus = request.get("status");
                if (newStatus == null || newStatus.trim().isEmpty()) {
                    return ResponseEntity.status(400).body("Status is required");
                }
                
                // TODO: Implement actual delivery status update when Delivery entity is created
                // For now, just return success response
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Delivery status updated successfully");
                response.put("deliveryId", deliveryId);
                response.put("newStatus", newStatus);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(404).body("Driver not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating delivery status: " + e.getMessage());
        }
    }
}
