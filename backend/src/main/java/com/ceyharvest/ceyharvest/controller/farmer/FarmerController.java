package com.ceyharvest.ceyharvest.controller.farmer;

import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/farmer")
public class FarmerController {
    @Autowired
    private FarmerRepository farmerRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Farmer>> getAllFarmers() {
        return ResponseEntity.ok(farmerRepository.findAll());
    }
} 