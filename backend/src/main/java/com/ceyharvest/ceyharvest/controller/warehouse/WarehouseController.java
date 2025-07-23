package com.ceyharvest.ceyharvest.controller.warehouse;

import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {
    @Autowired
    private FarmerRepository farmerRepository;
    @Autowired
    private ProductRepository productRepository;

    /**
     * Get all farmers for a warehouse, with optional search and sort
     */
    @GetMapping("/{warehouseId}/farmers")
    public ResponseEntity<?> getFarmersForWarehouse(
            @PathVariable String warehouseId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        // Debug: print current user's authorities
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] Authenticated user: " + (auth != null ? auth.getName() : "null"));
        System.out.println("[DEBUG] Authorities: " + (auth != null ? auth.getAuthorities() : "null"));
        List<Farmer> farmers = farmerRepository.findByWarehouseIdsContaining(warehouseId);

        // Filter by search if provided
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase(Locale.ROOT);
            farmers = farmers.stream().filter(farmer ->
                (farmer.getFirstName() != null && farmer.getFirstName().toLowerCase().contains(searchLower)) ||
                (farmer.getLastName() != null && farmer.getLastName().toLowerCase().contains(searchLower)) ||
                (farmer.getEmail() != null && farmer.getEmail().toLowerCase().contains(searchLower)) ||
                (farmer.getPhoneNumber() != null && farmer.getPhoneNumber().contains(search)) ||
                (farmer.getUsername() != null && farmer.getUsername().toLowerCase().contains(searchLower))
            ).collect(Collectors.toList());
        }

        // Sort
        Comparator<Farmer> comparator;
        switch (sortBy) {
            case "firstName":
                comparator = Comparator.comparing(Farmer::getFirstName, Comparator.nullsLast(String::compareTo));
                break;
            case "lastName":
                comparator = Comparator.comparing(Farmer::getLastName, Comparator.nullsLast(String::compareTo));
                break;
            case "email":
                comparator = Comparator.comparing(Farmer::getEmail, Comparator.nullsLast(String::compareTo));
                break;
            case "phoneNumber":
                comparator = Comparator.comparing(Farmer::getPhoneNumber, Comparator.nullsLast(String::compareTo));
                break;
            case "createdAt":
            default:
                comparator = Comparator.comparing(Farmer::getCreatedAt, Comparator.nullsLast((a, b) -> {
                    if (a == null && b == null) return 0;
                    if (a == null) return -1;
                    if (b == null) return 1;
                    return a.compareTo(b);
                }));
                break;
        }
        if (sortDir.equalsIgnoreCase("desc")) {
            comparator = comparator.reversed();
        }
        farmers = farmers.stream().sorted(comparator).collect(Collectors.toList());

        return ResponseEntity.ok(farmers);
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<?> getFarmerById(@PathVariable String farmerId) {
        return farmerRepository.findById(farmerId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get all products for a farmer
    @GetMapping("/farmer/{farmerId}/products")
    public ResponseEntity<?> getProductsForFarmer(@PathVariable String farmerId) {
        return ResponseEntity.ok(productRepository.findByFarmerId(farmerId));
    }

    // Add or update a product for a farmer
    @PostMapping("/farmer/{farmerId}/products")
    public ResponseEntity<?> addOrUpdateProductForFarmer(@PathVariable String farmerId, @RequestBody Product product) {
        // Check if product with same name exists for this farmer
        Optional<Product> existingOpt = productRepository.findByFarmerIdAndProductName(farmerId, product.getProductName());
        Product toSave;
        if (existingOpt.isPresent()) {
            // Update existing: increase stock, update price if changed, add to price history
            Product existing = existingOpt.get();
            int addedStock = product.getTotalStock();
            double newPrice = product.getLatestPrice();
            existing.setTotalStock(existing.getTotalStock() + addedStock);
            if (existing.getPriceHistory() == null) existing.setPriceHistory(new java.util.ArrayList<>());
            Product.PriceHistory ph = new Product.PriceHistory();
            ph.setPrice(newPrice);
            ph.setStockAdded(addedStock);
            ph.setTimestamp(java.time.LocalDateTime.now());
            existing.getPriceHistory().add(ph);
            existing.setLatestPrice(newPrice);
            toSave = existing;
        } else {
            // New product
            product.setFarmerId(farmerId);
            if (product.getPriceHistory() == null) product.setPriceHistory(new java.util.ArrayList<>());
            Product.PriceHistory ph = new Product.PriceHistory();
            ph.setPrice(product.getLatestPrice());
            ph.setStockAdded(product.getTotalStock());
            ph.setTimestamp(java.time.LocalDateTime.now());
            product.getPriceHistory().add(ph);
            toSave = product;
        }
        productRepository.save(toSave);
        return ResponseEntity.ok(toSave);
    }
} 