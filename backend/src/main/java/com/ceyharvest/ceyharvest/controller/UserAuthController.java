package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.config.AdminSecurityConfig;
import com.ceyharvest.ceyharvest.config.JwtTokenUtil;
import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.dto.*;
import com.ceyharvest.ceyharvest.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    // Farmer Registration
    @PostMapping("/farmer/register")
    public ResponseEntity<?> registerFarmer(@Valid @RequestBody SecureRegisterDTO dto) {
        if (farmerRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Farmer already exists");
        }
        
        // Encrypt password before saving
        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        Farmer farmer = new Farmer(null, dto.getUsername(), hashedPassword, dto.getEmail(), "FARMER");
        farmerRepository.save(farmer);
        
        // Generate JWT token
        String token = jwtTokenUtil.generateToken(farmer.getEmail(), farmer.getRole(), farmer.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", farmer);
        response.put("message", "Registration successful");
        
        return ResponseEntity.ok(response);
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
        if (buyerRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Buyer already exists");
        }
        
        // Encrypt password before saving
        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        Buyer buyer = new Buyer(null, dto.getUsername(), hashedPassword, dto.getEmail(), "BUYER");
        buyerRepository.save(buyer);
        
        // Generate JWT token
        String token = jwtTokenUtil.generateToken(buyer.getEmail(), buyer.getRole(), buyer.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", buyer);
        response.put("message", "Registration successful");
        
        return ResponseEntity.ok(response);
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
        if (driverRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Driver already exists");
        }
        
        // Encrypt password before saving
        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        Driver driver = new Driver(null, dto.getUsername(), hashedPassword, dto.getEmail(), "DRIVER");
        driverRepository.save(driver);
        
        // Generate JWT token
        String token = jwtTokenUtil.generateToken(driver.getEmail(), driver.getRole(), driver.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", driver);
        response.put("message", "Registration successful");
        
        return ResponseEntity.ok(response);
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
                adminRepository.save(admin);
                return ResponseEntity.ok("Password changed successfully");
            } else {
                return ResponseEntity.status(401).body("Current password is incorrect");
            }
        }
        return ResponseEntity.status(404).body("Admin not found");
    }
} 