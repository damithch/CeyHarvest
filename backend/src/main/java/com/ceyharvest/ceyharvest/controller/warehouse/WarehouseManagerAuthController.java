package com.ceyharvest.ceyharvest.controller.warehouse;

import com.ceyharvest.ceyharvest.document.WarehouseManager;
import com.ceyharvest.ceyharvest.repository.WarehouseManagerRepository;
import com.ceyharvest.ceyharvest.util.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/warehouse-manager")
public class WarehouseManagerAuthController {
    @Autowired
    private WarehouseManagerRepository warehouseManagerRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String phoneNumber = loginData.get("phoneNumber");
        String password = loginData.get("password");
        if (phoneNumber == null || password == null) {
            return ResponseEntity.badRequest().body("Phone number and password are required");
        }
        Optional<WarehouseManager> managerOpt = warehouseManagerRepository.findAll().stream()
            .filter(m -> phoneNumber.equals(m.getPhoneNumber()))
            .findFirst();
        if (managerOpt.isPresent()) {
            WarehouseManager manager = managerOpt.get();
            if (passwordEncoder.matches(password, manager.getPassword())) {
                String token = jwtTokenUtil.generateToken(manager.getPhoneNumber(), "WAREHOUSE_MANAGER", manager.getId());
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("manager", manager);
                response.put("message", "Login successful");
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
} 