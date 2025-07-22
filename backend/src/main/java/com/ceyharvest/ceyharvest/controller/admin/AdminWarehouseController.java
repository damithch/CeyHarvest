package com.ceyharvest.ceyharvest.controller.admin;

import com.ceyharvest.ceyharvest.document.Warehouse;
import com.ceyharvest.ceyharvest.document.WarehouseManager;
import com.ceyharvest.ceyharvest.repository.WarehouseManagerRepository;
import com.ceyharvest.ceyharvest.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/warehouses")
public class AdminWarehouseController {
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private WarehouseManagerRepository warehouseManagerRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register a new warehouse (with manager info)
    @PostMapping("/register")
    public ResponseEntity<?> registerWarehouse(@RequestBody Warehouse warehouse) {
        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(warehouse.getPassword());
        warehouse.setPassword(hashedPassword);
        Warehouse saved = warehouseRepository.save(warehouse);

        // Create WarehouseManager with warehouseId
        WarehouseManager manager = new WarehouseManager();
        manager.setName(warehouse.getManagerName());
        manager.setPhoneNumber(warehouse.getPhoneNumber());
        manager.setEmail(warehouse.getEmail());
        manager.setPassword(hashedPassword); // Use the same hashed password
        manager.setWarehouseId(saved.getId()); // Link to warehouse
        warehouseManagerRepository.save(manager);

        return ResponseEntity.ok(saved);
    }

    // List all warehouses
    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseRepository.findAll());
    }
} 