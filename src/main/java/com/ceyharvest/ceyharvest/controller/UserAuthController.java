package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.dto.*;
import com.ceyharvest.ceyharvest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // Farmer Registration
    @PostMapping("/farmer/register")
    public ResponseEntity<?> registerFarmer(@RequestBody RegisterDTO dto) {
        if (farmerRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Farmer already exists");
        }
        Farmer farmer = new Farmer(null, dto.getUsername(), dto.getPassword(), dto.getEmail(), "FARMER");
        farmerRepository.save(farmer);
        return ResponseEntity.ok(farmer);
    }

    // Farmer Login
    @PostMapping("/farmer/login")
    public ResponseEntity<?> loginFarmer(@RequestBody LoginDTO dto) {
        Optional<Farmer> farmer = farmerRepository.findByEmail(dto.getEmail());
        if (farmer.isPresent() && farmer.get().getPassword().equals(dto.getPassword())) {
            return ResponseEntity.ok(farmer.get());
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Buyer Registration
    @PostMapping("/buyer/register")
    public ResponseEntity<?> registerBuyer(@RequestBody BuyerRegisterDTO dto) {
        if (buyerRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Buyer already exists");
        }
        Buyer buyer = new Buyer(null, dto.getUsername(), dto.getPassword(), dto.getEmail(), "BUYER");
        buyerRepository.save(buyer);
        return ResponseEntity.ok(buyer);
    }

    // Buyer Login
    @PostMapping("/buyer/login")
    public ResponseEntity<?> loginBuyer(@RequestBody BuyerLoginDTO dto) {
        Optional<Buyer> buyer = buyerRepository.findByEmail(dto.getEmail());
        if (buyer.isPresent() && buyer.get().getPassword().equals(dto.getPassword())) {
            return ResponseEntity.ok(buyer.get());
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Driver Registration
    @PostMapping("/driver/register")
    public ResponseEntity<?> registerDriver(@RequestBody DriverRegisterDTO dto) {
        if (driverRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Driver already exists");
        }
        Driver driver = new Driver(null, dto.getUsername(), dto.getPassword(), dto.getEmail(), "DRIVER");
        driverRepository.save(driver);
        return ResponseEntity.ok(driver);
    }

    // Driver Login
    @PostMapping("/driver/login")
    public ResponseEntity<?> loginDriver(@RequestBody DriverLoginDTO dto) {
        Optional<Driver> driver = driverRepository.findByEmail(dto.getEmail());
        if (driver.isPresent() && driver.get().getPassword().equals(dto.getPassword())) {
            return ResponseEntity.ok(driver.get());
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Admin Registration
    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegisterDTO dto) {
        if (adminRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Admin already exists");
        }
        Admin admin = new Admin(null, dto.getUsername(), dto.getPassword(), dto.getEmail(), "ADMIN");
        adminRepository.save(admin);
        return ResponseEntity.ok(admin);
    }

    // Admin Login
    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody AdminLoginDTO dto) {
        Optional<Admin> admin = adminRepository.findByEmail(dto.getEmail());
        if (admin.isPresent() && admin.get().getPassword().equals(dto.getPassword())) {
            return ResponseEntity.ok(admin.get());
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
} 