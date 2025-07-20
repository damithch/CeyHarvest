package com.ceyharvest.ceyharvest.controller.auth;

import com.ceyharvest.ceyharvest.config.security.AdminSecurityConfig;
import com.ceyharvest.ceyharvest.util.JwtTokenUtil;
import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.dto.*;
import com.ceyharvest.ceyharvest.repository.*;
import com.ceyharvest.ceyharvest.service.EmailVerificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserAuthController {
    @Autowired
    private FarmerRepository farmerRepository;
    @Autowired
    private BuyerRepository buyerRepository;
    @Autowired
    private DriverRepository driverRepository;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AdminSecurityConfig adminSecurityConfig;
    @Autowired
    private EmailVerificationService emailVerificationService;
    
    // Helper method to check for duplicate email or phone
    private ResponseEntity<?> checkForDuplicates(String email, String phoneNumber) {
        // Check email duplicates across all user types
        if (email != null && !email.isEmpty()) {
            if (farmerRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(409).body("Email already registered as farmer");
            }
            if (buyerRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(409).body("Email already registered as buyer");
            }
            if (driverRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(409).body("Email already registered as driver");
            }
            if (adminRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(409).body("Email already registered as admin");
            }
        }
        
        // Check phone number duplicates across all user types (if phone number provided)
        if (phoneNumber != null && !phoneNumber.isEmpty()) {
            if (farmerRepository.findFirstByPhoneNumber(phoneNumber).isPresent()) {
                return ResponseEntity.status(409).body("Phone number already registered as farmer");
            }
            if (buyerRepository.findFirstByPhoneNumber(phoneNumber).isPresent()) {
                return ResponseEntity.status(409).body("Phone number already registered as buyer");
            }
            if (driverRepository.findFirstByPhoneNumber(phoneNumber).isPresent()) {
                return ResponseEntity.status(409).body("Phone number already registered as driver");
            }
        }
        
        return null; // No duplicates found
    }

    // Farmer Registration
    @PostMapping("/farmer/register")
    public ResponseEntity<?> registerFarmer(@Valid @RequestBody SecureRegisterDTO dto) {
        // Check for duplicate email or phone number
        ResponseEntity<?> duplicateCheck = checkForDuplicates(dto.getEmail(), dto.getPhoneNumber());
        if (duplicateCheck != null) {
            return duplicateCheck;
        }
        
        try {
            // Encrypt password before storing for verification
            String hashedPassword = passwordEncoder.encode(dto.getPassword());
            Farmer farmer = new Farmer();
            farmer.setUsername(dto.getUsername());
            farmer.setPassword(hashedPassword);
            farmer.setEmail(dto.getEmail());
            farmer.setRole("FARMER");
            
            // Set additional fields if provided
            if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isEmpty()) {
                farmer.setPhoneNumber(dto.getPhoneNumber());
            }
            if (dto.getFirstName() != null && !dto.getFirstName().isEmpty()) {
                farmer.setFirstName(dto.getFirstName());
            }
            if (dto.getLastName() != null && !dto.getLastName().isEmpty()) {
                farmer.setLastName(dto.getLastName());
            }
            if (dto.getAddress() != null && !dto.getAddress().isEmpty()) {
                farmer.setAddress(dto.getAddress());
            }
            if (dto.getCity() != null && !dto.getCity().isEmpty()) {
                farmer.setCity(dto.getCity());
            }
            if (dto.getPostalCode() != null && !dto.getPostalCode().isEmpty()) {
                farmer.setPostalCode(dto.getPostalCode());
            }
            
            // Send verification email instead of saving directly
            boolean emailSent = emailVerificationService.sendVerificationCode(dto.getEmail(), "FARMER", farmer);
            
            if (emailSent) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Registration initiated! Please check your email for verification code");
                response.put("email", dto.getEmail());
                response.put("userType", "FARMER");
                response.put("requiresVerification", true);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body("Failed to send verification email. Please try again.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    // Farmer Login
    @PostMapping("/farmer/login")
    public ResponseEntity<?> loginFarmer(@Valid @RequestBody SecureLoginDTO dto) {
        Optional<Farmer> farmerOpt = farmerRepository.findByEmail(dto.getEmail());
        if (farmerOpt.isPresent()) {
            Farmer farmer = farmerOpt.get();
            // Check encrypted password
            if (passwordEncoder.matches(dto.getPassword(), farmer.getPassword())) {
                // Generate JWT token
                String token = jwtTokenUtil.generateToken(farmer.getEmail(), farmer.getRole(), farmer.getId());
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", farmer);
                response.put("message", "Login successful");
                
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Buyer Registration
    @PostMapping("/buyer/register")
    public ResponseEntity<?> registerBuyer(@Valid @RequestBody SecureRegisterDTO dto) {
        // Check for duplicate email or phone number
        ResponseEntity<?> duplicateCheck = checkForDuplicates(dto.getEmail(), dto.getPhoneNumber());
        if (duplicateCheck != null) {
            return duplicateCheck;
        }
        
        try {
            // Encrypt password before storing for verification
            String hashedPassword = passwordEncoder.encode(dto.getPassword());
            Buyer buyer = new Buyer();
            buyer.setUsername(dto.getUsername());
            buyer.setFirstName(dto.getFirstName());
            buyer.setLastName(dto.getLastName());
            buyer.setEmail(dto.getEmail());
            buyer.setPhoneNumber(dto.getPhoneNumber());
            buyer.setAddress(dto.getAddress());
            buyer.setCity(dto.getCity());
            buyer.setPostalCode(dto.getPostalCode());
            buyer.setPassword(hashedPassword);
            buyer.setRole("BUYER");
            buyer.setCreatedAt(LocalDateTime.now());
            buyer.setUpdatedAt(LocalDateTime.now());
            
            // Send verification email instead of saving directly
            boolean emailSent = emailVerificationService.sendVerificationCode(dto.getEmail(), "BUYER", buyer);
            
            if (emailSent) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Registration initiated! Please check your email for verification code");
                response.put("email", dto.getEmail());
                response.put("userType", "BUYER");
                response.put("requiresVerification", true);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body("Failed to send verification email. Please try again.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    // Buyer Login
    @PostMapping("/buyer/login")
    public ResponseEntity<?> loginBuyer(@Valid @RequestBody SecureLoginDTO dto) {
        Optional<Buyer> buyerOpt = buyerRepository.findByEmail(dto.getEmail());
        if (buyerOpt.isPresent()) {
            Buyer buyer = buyerOpt.get();
            // Check encrypted password
            if (passwordEncoder.matches(dto.getPassword(), buyer.getPassword())) {
                // Generate JWT token
                String token = jwtTokenUtil.generateToken(buyer.getEmail(), buyer.getRole(), buyer.getId());
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", buyer);
                response.put("message", "Login successful");
                
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Driver Registration
    @PostMapping("/driver/register")
    public ResponseEntity<?> registerDriver(@Valid @RequestBody SecureRegisterDTO dto) {
        // Check for duplicate email or phone number
        ResponseEntity<?> duplicateCheck = checkForDuplicates(dto.getEmail(), dto.getPhoneNumber());
        if (duplicateCheck != null) {
            return duplicateCheck;
        }
        
        try {
            // Encrypt password before storing for verification
            String hashedPassword = passwordEncoder.encode(dto.getPassword());
            Driver driver = new Driver();
            driver.setUsername(dto.getUsername());
            driver.setPassword(hashedPassword);
            driver.setEmail(dto.getEmail());
            driver.setRole("DRIVER");
            
            // Set additional fields if provided
            if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isEmpty()) {
                driver.setPhoneNumber(dto.getPhoneNumber());
            }
            if (dto.getFirstName() != null && !dto.getFirstName().isEmpty()) {
                driver.setFirstName(dto.getFirstName());
            }
            if (dto.getLastName() != null && !dto.getLastName().isEmpty()) {
                driver.setLastName(dto.getLastName());
            }
            if (dto.getAddress() != null && !dto.getAddress().isEmpty()) {
                driver.setAddress(dto.getAddress());
            }
            if (dto.getCity() != null && !dto.getCity().isEmpty()) {
                driver.setCity(dto.getCity());
            }
            if (dto.getPostalCode() != null && !dto.getPostalCode().isEmpty()) {
                driver.setPostalCode(dto.getPostalCode());
            }
            
            // Send verification email instead of saving directly
            boolean emailSent = emailVerificationService.sendVerificationCode(dto.getEmail(), "DRIVER", driver);
            
            if (emailSent) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Registration initiated! Please check your email for verification code");
                response.put("email", dto.getEmail());
                response.put("userType", "DRIVER");
                response.put("requiresVerification", true);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body("Failed to send verification email. Please try again.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    // Driver Login
    @PostMapping("/driver/login")
    public ResponseEntity<?> loginDriver(@Valid @RequestBody SecureLoginDTO dto) {
        Optional<Driver> driverOpt = driverRepository.findByEmail(dto.getEmail());
        if (driverOpt.isPresent()) {
            Driver driver = driverOpt.get();
            // Check encrypted password
            if (passwordEncoder.matches(dto.getPassword(), driver.getPassword())) {
                // Generate JWT token
                String token = jwtTokenUtil.generateToken(driver.getEmail(), driver.getRole(), driver.getId());
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", driver);
                response.put("message", "Login successful");
                
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Admin Registration - COMPLETELY DISABLED FOR SECURITY
    // Only authorized admin emails (jayaofficialj2@gmail.com, kaveeshatech@gmail.com) are allowed
    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody SecureRegisterDTO dto) {
        return ResponseEntity.status(403).body("Admin registration is disabled. Only authorized administrators can access admin accounts. Contact system administrator.");
    }

    // Admin Login
    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@Valid @RequestBody SecureLoginDTO dto) {
        // Extra security check - only allow authorized admin emails
        if (!adminSecurityConfig.isAuthorizedAdminEmail(dto.getEmail())) {
            return ResponseEntity.status(403).body("Unauthorized admin email. Contact system administrator.");
        }
        
        Optional<Admin> adminOpt = adminRepository.findByEmail(dto.getEmail());
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            // Check encrypted password
            if (passwordEncoder.matches(dto.getPassword(), admin.getPassword())) {
                // Generate JWT token
                String token = jwtTokenUtil.generateToken(admin.getEmail(), admin.getRole(), admin.getId());
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", admin);
                response.put("message", "Login successful");
                
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Admin Password Change
    @PostMapping("/admin/change-password")
    public ResponseEntity<?> changeAdminPassword(@RequestBody AdminPasswordChangeDTO dto) {
        // Extra security check - only allow authorized admin emails
        if (!adminSecurityConfig.isAuthorizedAdminEmail(dto.getEmail())) {
            return ResponseEntity.status(403).body("Unauthorized admin email. Contact system administrator.");
        }
        
        Optional<Admin> adminOpt = adminRepository.findByEmail(dto.getEmail());
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            // Check old password using password encoder
            if (passwordEncoder.matches(dto.getOldPassword(), admin.getPassword())) {
                // Encrypt new password before saving
                admin.setPassword(passwordEncoder.encode(dto.getNewPassword()));
                admin.setPasswordChangedFromDefault(true); // Mark that password has been changed from default
                adminRepository.save(admin);
                return ResponseEntity.ok("Password changed successfully");
            } else {
                return ResponseEntity.status(401).body("Current password is incorrect");
            }
        }
        return ResponseEntity.status(404).body("Admin not found");
    }
}