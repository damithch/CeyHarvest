package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.repository.*;
import com.ceyharvest.ceyharvest.util.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class UnifiedAuthService {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private FarmerRepository farmerRepository;
    
    @Autowired
    private BuyerRepository buyerRepository;
    
    @Autowired
    private DriverRepository driverRepository;
    
    @Autowired
    private WarehouseManagerRepository warehouseManagerRepository;
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    /**
     * Unified login method that searches across all user types
     */
    public Map<String, Object> attemptLogin(String email, String password) {
        // Try Admin first
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (passwordEncoder.matches(password, admin.getPassword())) {
                if (!admin.isEmailVerified()) {
                    return createUnverifiedEmailResponse(admin.getEmail());
                }
                return createLoginResponse(admin.getEmail(), admin.getRole(), admin.getId(), admin, "ADMIN");
            }
        }

        // Try Warehouse by email
        Optional<Warehouse> warehouseOpt = warehouseRepository.findAll().stream()
            .filter(w -> email.equalsIgnoreCase(w.getEmail()))
            .findFirst();
        if (warehouseOpt.isPresent() && passwordEncoder.matches(password, warehouseOpt.get().getPassword())) {
            Warehouse warehouse = warehouseOpt.get();
            return createLoginResponse(warehouse.getEmail(), "WAREHOUSE", warehouse.getId(), warehouse, "WAREHOUSE");
        }

        // Try WarehouseManager
        Optional<WarehouseManager> wmOpt = warehouseManagerRepository.findAll().stream().filter(m -> email.equals(m.getPhoneNumber()) || email.equalsIgnoreCase(m.getEmail())).findFirst();
        if (wmOpt.isPresent()) {
            WarehouseManager wm = wmOpt.get();
            if (passwordEncoder.matches(password, wm.getPassword())) {
                return createLoginResponse(wm.getEmail(), "WAREHOUSE_MANAGER", wm.getId(), wm, "WAREHOUSE_MANAGER");
            }
        }

        // Try Farmer
        Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
        if (farmerOpt.isPresent()) {
            Farmer farmer = farmerOpt.get();
            if (passwordEncoder.matches(password, farmer.getPassword())) {
                if (!farmer.isEmailVerified()) {
                    return createUnverifiedEmailResponse(farmer.getEmail());
                }
                return createLoginResponse(farmer.getEmail(), farmer.getRole(), farmer.getId(), farmer, "FARMER");
            }
        }

        // Try Buyer
        Optional<Buyer> buyerOpt = buyerRepository.findByEmail(email);
        if (buyerOpt.isPresent()) {
            Buyer buyer = buyerOpt.get();
            if (passwordEncoder.matches(password, buyer.getPassword())) {
                if (!buyer.isEmailVerified()) {
                    return createUnverifiedEmailResponse(buyer.getEmail());
                }
                return createLoginResponse(buyer.getEmail(), buyer.getRole(), buyer.getId(), buyer, "BUYER");
            }
        }

        // Try Driver
        Optional<Driver> driverOpt = driverRepository.findByEmail(email);
        if (driverOpt.isPresent()) {
            Driver driver = driverOpt.get();
            if (passwordEncoder.matches(password, driver.getPassword())) {
                if (!driver.isEmailVerified()) {
                    return createUnverifiedEmailResponse(driver.getEmail());
                }
                return createLoginResponse(driver.getEmail(), driver.getRole(), driver.getId(), driver, "DRIVER");
            }
        }

        return null; // No match found
    }

    /**
     * Unified login method that accepts both email and phone number
     */
    public Map<String, Object> attemptLoginWithIdentifier(String identifier, String password) {
        // Check if identifier is email or phone number
        boolean isEmail = identifier.contains("@");
        
        if (isEmail) {
            // Use existing email-based login
            return attemptLogin(identifier, password);
        } else {
            // Try Warehouse by phone or email
            Optional<Warehouse> warehouseOpt = warehouseRepository.findAll().stream()
                .filter(w -> identifier.equals(w.getPhoneNumber()) || identifier.equalsIgnoreCase(w.getEmail()))
                .findFirst();
            if (warehouseOpt.isPresent() && passwordEncoder.matches(password, warehouseOpt.get().getPassword())) {
                Warehouse warehouse = warehouseOpt.get();
                return createLoginResponse(warehouse.getEmail(), "WAREHOUSE", warehouse.getId(), warehouse, "WAREHOUSE");
            }
            // Search by phone number across all user types
            // Try Farmer by phone
            Optional<Farmer> farmerOpt = farmerRepository.findFirstByPhoneNumber(identifier);
            if (farmerOpt.isPresent() && passwordEncoder.matches(password, farmerOpt.get().getPassword())) {
                Farmer farmer = farmerOpt.get();
                return createLoginResponse(farmer.getEmail(), farmer.getRole(), farmer.getId(), farmer, "FARMER");
            }

            // Try Buyer by phone
            Optional<Buyer> buyerOpt = buyerRepository.findFirstByPhoneNumber(identifier);
            if (buyerOpt.isPresent() && passwordEncoder.matches(password, buyerOpt.get().getPassword())) {
                Buyer buyer = buyerOpt.get();
                return createLoginResponse(buyer.getEmail(), buyer.getRole(), buyer.getId(), buyer, "BUYER");
            }

            // Try Driver by phone
            Optional<Driver> driverOpt = driverRepository.findFirstByPhoneNumber(identifier);
            if (driverOpt.isPresent() && passwordEncoder.matches(password, driverOpt.get().getPassword())) {
                Driver driver = driverOpt.get();
                return createLoginResponse(driver.getEmail(), driver.getRole(), driver.getId(), driver, "DRIVER");
            }

            return null; // No match found for phone number
        }
    }

    /**
     * Check if email exists across all user types
     */
    public String findUserRoleByEmail(String email) {
        if (adminRepository.findByEmail(email).isPresent()) {
            return "ADMIN";
        }
        if (warehouseManagerRepository.findAll().stream().anyMatch(m -> email.equals(m.getPhoneNumber()) || email.equalsIgnoreCase(m.getEmail()))) {
            return "WAREHOUSE_MANAGER";
        }
        if (farmerRepository.findByEmail(email).isPresent()) {
            return "FARMER";
        }
        if (buyerRepository.findByEmail(email).isPresent()) {
            return "BUYER";
        }
        if (driverRepository.findByEmail(email).isPresent()) {
            return "DRIVER";
        }
        return null;
    }

    /**
     * Check if email is already registered
     */
    public boolean isEmailRegistered(String email) {
        return findUserRoleByEmail(email) != null;
    }

    /**
     * Get user by email and role for password reset
     */
    public Object getUserByEmailAndRole(String email, String role) {
        switch (role.toUpperCase()) {
            case "ADMIN":
                return adminRepository.findByEmail(email).orElse(null);
            case "WAREHOUSE_MANAGER":
                return warehouseManagerRepository.findAll().stream().filter(m -> email.equals(m.getPhoneNumber()) || email.equalsIgnoreCase(m.getEmail())).findFirst().orElse(null);
            case "FARMER":
                return farmerRepository.findByEmail(email).orElse(null);
            case "BUYER":
                return buyerRepository.findByEmail(email).orElse(null);
            case "DRIVER":
                return driverRepository.findByEmail(email).orElse(null);
            default:
                return null;
        }
    }

    /**
     * Update password for user
     */
    public boolean updatePassword(String email, String newPassword) {
        String role = findUserRoleByEmail(email);
        if (role == null) {
            return false;
        }

        String hashedPassword = passwordEncoder.encode(newPassword);

        switch (role) {
            case "ADMIN":
                Optional<Admin> adminOpt = adminRepository.findByEmail(email);
                if (adminOpt.isPresent()) {
                    Admin admin = adminOpt.get();
                    admin.setPassword(hashedPassword);
                    admin.setPasswordChangedFromDefault(true); // Mark that password has been changed from default
                    adminRepository.save(admin);
                    return true;
                }
                break;
            case "FARMER":
                Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
                if (farmerOpt.isPresent()) {
                    Farmer farmer = farmerOpt.get();
                    farmer.setPassword(hashedPassword);
                    farmerRepository.save(farmer);
                    return true;
                }
                break;
            case "BUYER":
                Optional<Buyer> buyerOpt = buyerRepository.findByEmail(email);
                if (buyerOpt.isPresent()) {
                    Buyer buyer = buyerOpt.get();
                    buyer.setPassword(hashedPassword);
                    buyerRepository.save(buyer);
                    return true;
                }
                break;
            case "DRIVER":
                Optional<Driver> driverOpt = driverRepository.findByEmail(email);
                if (driverOpt.isPresent()) {
                    Driver driver = driverOpt.get();
                    driver.setPassword(hashedPassword);
                    driverRepository.save(driver);
                    return true;
                }
                break;
        }
        return false;
    }

    private Map<String, Object> createLoginResponse(String email, String role, String userId, Object user, String roleForToken) {
        String token = jwtTokenUtil.generateToken(email, roleForToken, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        response.put("role", roleForToken);
        response.put("message", "Login successful");
        
        return response;
    }

    private Map<String, Object> createUnverifiedEmailResponse(String email) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "UNVERIFIED_EMAIL");
        response.put("message", "Email has not been verified yet. Please check your email or resend verification code.");
        response.put("email", email);
        response.put("requiresVerification", true);
        
        return response;
    }
}
