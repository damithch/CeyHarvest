package com.ceyharvest.ceyharvest.controller.admin;

import com.ceyharvest.ceyharvest.document.Warehouse;
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
    private PasswordEncoder passwordEncoder;

    // Register a new warehouse (with manager info)
    @PostMapping("/register")
    public ResponseEntity<?> registerWarehouse(@RequestBody Warehouse warehouse) {
        // Hash the password before saving
        warehouse.setPassword(passwordEncoder.encode(warehouse.getPassword()));
        Warehouse saved = warehouseRepository.save(warehouse);
        return ResponseEntity.ok(saved);
    }

    // List all warehouses
    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseRepository.findAll());
    }
} 