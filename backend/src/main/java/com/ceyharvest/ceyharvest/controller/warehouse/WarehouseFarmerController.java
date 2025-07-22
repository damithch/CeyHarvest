package com.ceyharvest.ceyharvest.controller.warehouse;

import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.document.FarmerWarehouse;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import com.ceyharvest.ceyharvest.repository.FarmerWarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/warehouse/{warehouseId}/farmers")
public class WarehouseFarmerController {
    @Autowired
    private FarmerWarehouseRepository farmerWarehouseRepository;
    @Autowired
    private FarmerRepository farmerRepository;

    // Register a farmer to this warehouse (many-to-many)
    @PostMapping("/register")
    public ResponseEntity<?> registerFarmerToWarehouse(@PathVariable String warehouseId, @RequestBody String farmerId) {
        // Check if already registered
        List<FarmerWarehouse> existing = farmerWarehouseRepository.findByWarehouseId(warehouseId);
        boolean alreadyRegistered = existing.stream().anyMatch(fw -> fw.getFarmerId().equals(farmerId));
        if (alreadyRegistered) {
            return ResponseEntity.status(409).body("Farmer already registered to this warehouse");
        }
        FarmerWarehouse fw = new FarmerWarehouse();
        fw.setFarmerId(farmerId);
        fw.setWarehouseId(warehouseId);
        farmerWarehouseRepository.save(fw);
        return ResponseEntity.ok(fw);
    }

    // List all farmers for this warehouse
    @GetMapping
    public ResponseEntity<List<Farmer>> getFarmersForWarehouse(@PathVariable String warehouseId) {
        List<FarmerWarehouse> links = farmerWarehouseRepository.findByWarehouseId(warehouseId);
        List<String> farmerIds = links.stream().map(FarmerWarehouse::getFarmerId).collect(Collectors.toList());
        List<Farmer> farmers = farmerRepository.findAll().stream()
            .filter(f -> farmerIds.contains(f.getId()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(farmers);
    }

    // Search farmers by name or phone for this warehouse
    @GetMapping("/search")
    public ResponseEntity<List<Farmer>> searchFarmers(@PathVariable String warehouseId, @RequestParam String query) {
        List<FarmerWarehouse> links = farmerWarehouseRepository.findByWarehouseId(warehouseId);
        List<String> farmerIds = links.stream().map(FarmerWarehouse::getFarmerId).collect(Collectors.toList());
        List<Farmer> farmers = farmerRepository.findAll().stream()
            .filter(f -> farmerIds.contains(f.getId()))
            .filter(f -> (f.getFirstName() != null && f.getFirstName().toLowerCase().contains(query.toLowerCase())) ||
                         (f.getLastName() != null && f.getLastName().toLowerCase().contains(query.toLowerCase())) ||
                         (f.getPhoneNumber() != null && f.getPhoneNumber().contains(query)))
            .collect(Collectors.toList());
        return ResponseEntity.ok(farmers);
    }

    // Sort farmers by name for this warehouse
    @GetMapping("/sort")
    public ResponseEntity<List<Farmer>> sortFarmers(@PathVariable String warehouseId, @RequestParam(defaultValue = "asc") String order) {
        List<FarmerWarehouse> links = farmerWarehouseRepository.findByWarehouseId(warehouseId);
        List<String> farmerIds = links.stream().map(FarmerWarehouse::getFarmerId).collect(Collectors.toList());
        List<Farmer> farmers = farmerRepository.findAll().stream()
            .filter(f -> farmerIds.contains(f.getId()))
            .sorted((f1, f2) -> {
                String name1 = (f1.getFirstName() != null ? f1.getFirstName() : "") + (f1.getLastName() != null ? f1.getLastName() : "");
                String name2 = (f2.getFirstName() != null ? f2.getFirstName() : "") + (f2.getLastName() != null ? f2.getLastName() : "");
                return order.equals("desc") ? name2.compareToIgnoreCase(name1) : name1.compareToIgnoreCase(name2);
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(farmers);
    }
} 