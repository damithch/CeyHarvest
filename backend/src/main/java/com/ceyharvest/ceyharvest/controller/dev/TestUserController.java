package com.ceyharvest.ceyharvest.controller.dev;

import com.ceyharvest.ceyharvest.document.Buyer;
import com.ceyharvest.ceyharvest.repository.BuyerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Development controller for creating test users
 * This controller should be removed in production
 */
@RestController
@RequestMapping("/api/dev")
public class TestUserController {

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a pre-verified test buyer for development testing
     */
    @PostMapping("/create-test-buyer")
    public ResponseEntity<?> createTestBuyer() {
        try {
            String testEmail = "testbuyer@ceyharvest.dev";
            
            // Check if test buyer already exists
            Optional<Buyer> existingBuyer = buyerRepository.findByEmail(testEmail);
            if (existingBuyer.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Test buyer already exists");
                response.put("email", testEmail);
                response.put("password", "testpass123");
                response.put("note", "Use these credentials to login");
                return ResponseEntity.ok(response);
            }

            // Create test buyer
            Buyer testBuyer = new Buyer();
            testBuyer.setUsername("testbuyer");
            testBuyer.setFirstName("Test");
            testBuyer.setLastName("Buyer");
            testBuyer.setEmail(testEmail);
            testBuyer.setPhoneNumber("0777777777");
            testBuyer.setPassword(passwordEncoder.encode("testpass123"));
            testBuyer.setRole("BUYER");
            testBuyer.setAddress("123 Test Street");
            testBuyer.setCity("Colombo");
            testBuyer.setPostalCode("10100");
            testBuyer.setCountry("Sri Lanka");
            testBuyer.setEmailVerified(true); // Pre-verified for testing
            testBuyer.setCreatedAt(LocalDateTime.now());
            testBuyer.setUpdatedAt(LocalDateTime.now());

            Buyer savedBuyer = buyerRepository.save(testBuyer);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test buyer created successfully");
            response.put("email", testEmail);
            response.put("password", "testpass123");
            response.put("buyerId", savedBuyer.getId());
            response.put("emailVerified", true);
            response.put("note", "Use these credentials to login and test add to cart functionality");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create test buyer");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Get test buyer credentials
     */
    @GetMapping("/test-buyer-info")
    public ResponseEntity<?> getTestBuyerInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("email", "testbuyer@ceyharvest.dev");
        response.put("password", "testpass123");
        response.put("note", "Use these credentials to login and test the application");
        response.put("endpoint", "POST /api/dev/create-test-buyer to create the account if it doesn't exist");
        return ResponseEntity.ok(response);
    }
}
