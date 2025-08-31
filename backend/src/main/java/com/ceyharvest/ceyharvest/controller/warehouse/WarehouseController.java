package com.ceyharvest.ceyharvest.controller.warehouse;

import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.document.Warehouse;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import com.ceyharvest.ceyharvest.repository.WarehouseRepository;
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
import java.util.Map;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {
    @Autowired
    private FarmerRepository farmerRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;

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

    // Edit a product for a farmer
    @PutMapping("/farmer/{farmerId}/products/{productId}")
    public ResponseEntity<?> editProductForFarmer(@PathVariable String farmerId, @PathVariable String productId, @RequestBody Product updated) {
        Optional<Product> existingOpt = productRepository.findById(productId);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        Product existing = existingOpt.get();
        if (!farmerId.equals(existing.getFarmerId())) return ResponseEntity.status(403).body("Not allowed");
        // If price or stock changes, add to price history
        boolean priceChanged = updated.getLatestPrice() != existing.getLatestPrice();
        boolean stockChanged = updated.getTotalStock() != existing.getTotalStock();
        if (priceChanged || stockChanged) {
            if (existing.getPriceHistory() == null) existing.setPriceHistory(new java.util.ArrayList<>());
            Product.PriceHistory ph = new Product.PriceHistory();
            ph.setPrice(updated.getLatestPrice());
            ph.setStockAdded(updated.getTotalStock() - existing.getTotalStock());
            ph.setTimestamp(java.time.LocalDateTime.now());
            existing.getPriceHistory().add(ph);
        }
        existing.setProductName(updated.getProductName());
        existing.setLocation(updated.getLocation());
        existing.setTotalStock(updated.getTotalStock());
        existing.setLatestPrice(updated.getLatestPrice());
        existing.setHarvestDay(updated.getHarvestDay());
        existing.setShelfLife(updated.getShelfLife());
        productRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    // Delete a product for a farmer
    @DeleteMapping("/farmer/{farmerId}/products/{productId}")
    public ResponseEntity<?> deleteProductForFarmer(@PathVariable String farmerId, @PathVariable String productId) {
        Optional<Product> existingOpt = productRepository.findById(productId);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        Product existing = existingOpt.get();
        if (!farmerId.equals(existing.getFarmerId())) return ResponseEntity.status(403).body("Not allowed");
        productRepository.deleteById(productId);
        return ResponseEntity.ok().build();
    }

    // Product summary for warehouse
    @GetMapping("/{warehouseId}/products/summary")
    public ResponseEntity<?> getWarehouseProductSummary(@PathVariable String warehouseId) {
        // Get all farmers in this warehouse
        List<Farmer> farmers = farmerRepository.findByWarehouseIdsContaining(warehouseId);
        // Get all products for these farmers
        List<Product> allProducts = new java.util.ArrayList<>();
        for (Farmer farmer : farmers) {
            allProducts.addAll(productRepository.findByFarmerId(farmer.getId()));
        }
        // Group by productName
        Map<String, List<Product>> grouped = allProducts.stream().collect(java.util.stream.Collectors.groupingBy(Product::getProductName));
        // Build summary
        List<java.util.Map<String, Object>> summary = new java.util.ArrayList<>();
        for (var entry : grouped.entrySet()) {
            String productName = entry.getKey();
            List<Product> products = entry.getValue();
            int totalStock = products.stream().mapToInt(Product::getTotalStock).sum();
            double latestPrice = products.stream().mapToDouble(Product::getLatestPrice).max().orElse(0);
            summary.add(java.util.Map.of(
                "productName", productName,
                "totalStock", totalStock,
                "latestPrice", latestPrice
            ));
        }
        return ResponseEntity.ok(summary);
    }

    // Farmers for a product in a warehouse
    @GetMapping("/{warehouseId}/products/{productName}/farmers")
    public ResponseEntity<?> getFarmersForProductInWarehouse(@PathVariable String warehouseId, @PathVariable String productName) {
        List<Farmer> farmers = farmerRepository.findByWarehouseIdsContaining(warehouseId);
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (Farmer farmer : farmers) {
            productRepository.findByFarmerIdAndProductName(farmer.getId(), productName).ifPresent(product -> {
                result.add(java.util.Map.of(
                    "farmerId", farmer.getId(),
                    "farmerName", farmer.getFirstName() + " " + farmer.getLastName(),
                    "stock", product.getTotalStock(),
                    "price", product.getLatestPrice()
                ));
            });
        }
        return ResponseEntity.ok(result);
    }

    // Marketplace endpoint: get all products with basic info
    @GetMapping("/marketplace/products")
    public ResponseEntity<?> getMarketplaceProducts(@RequestParam(required = false) String district) {
        List<Product> allProducts = productRepository.findAll();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (Product prod : allProducts) {
            // Skip products with no name or zero stock
            if (prod.getProductName() == null || prod.getProductName().isEmpty() || prod.getTotalStock() <= 0) {
                continue;
            }
            
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("productId", prod.getId());
            map.put("productName", prod.getProductName());
            map.put("latestPrice", prod.getLatestPrice());
            map.put("totalStock", prod.getTotalStock());
            map.put("farmerId", prod.getFarmerId());
            map.put("location", prod.getLocation());
            map.put("harvestDay", prod.getHarvestDay());
            map.put("shelfLife", prod.getShelfLife());
            result.add(map);
        }
        
        return ResponseEntity.ok(result);
    }
} 