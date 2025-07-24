package com.ceyharvest.ceyharvest.controller.buyer;

import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buyer")
public class BuyerProductController {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get all available products for buyers to purchase
     * This endpoint provides products with availability filtering
     */
    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") double minPrice,
            @RequestParam(defaultValue = "999999") double maxPrice) {
        
        try {
            List<Product> products = productRepository.findAll();
            
            // Filter products that are in stock
            List<Product> availableProducts = products.stream()
                .filter(product -> product.getQuantity() > 0)
                .collect(Collectors.toList());

            // Apply category filter
            if (category != null && !category.trim().isEmpty()) {
                availableProducts = availableProducts.stream()
                    .filter(product -> product.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
            }

            // Apply search filter
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                availableProducts = availableProducts.stream()
                    .filter(product -> 
                        product.getName().toLowerCase().contains(searchLower) ||
                        product.getDescription().toLowerCase().contains(searchLower) ||
                        product.getCategory().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
            }

            // Apply price filter
            availableProducts = availableProducts.stream()
                .filter(product -> product.getPrice() >= minPrice && product.getPrice() <= maxPrice)
                .collect(Collectors.toList());

            // Convert to buyer-friendly format with additional information
            List<Map<String, Object>> productResponse = availableProducts.stream()
                .map(this::convertProductToBuyerFormat)
                .collect(Collectors.toList());

            return ResponseEntity.ok(productResponse);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    /**
     * Get product by ID for detailed view
     */
    @GetMapping("/products/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable String productId) {
        try {
            Optional<Product> productOpt = productRepository.findById(productId);
            
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                
                // Check if product is available
                if (product.getQuantity() <= 0) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("error", "Product is out of stock");
                    response.put("productId", productId);
                    return ResponseEntity.status(410).body(response); // 410 Gone
                }
                
                Map<String, Object> productDetails = convertProductToBuyerFormat(product);
                return ResponseEntity.ok(productDetails);
            } else {
                return ResponseEntity.status(404).body("Product not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving product: " + e.getMessage());
        }
    }

    /**
     * Get products by category
     */
    @GetMapping("/products/category/{category}")
    public ResponseEntity<List<Map<String, Object>>> getProductsByCategory(@PathVariable String category) {
        try {
            List<Product> products = productRepository.findAll().stream()
                .filter(product -> product.getQuantity() > 0 && 
                        product.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());

            List<Map<String, Object>> productResponse = products.stream()
                .map(this::convertProductToBuyerFormat)
                .collect(Collectors.toList());

            return ResponseEntity.ok(productResponse);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    /**
     * Get all available categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        try {
            List<String> categories = productRepository.findAll().stream()
                .filter(product -> product.getQuantity() > 0)
                .map(Product::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    /**
     * Get buyer statistics about products
     */
    @GetMapping("/{buyerEmail}/stats")
    public ResponseEntity<Map<String, Object>> getBuyerStats(@PathVariable String buyerEmail) {
        try {
            List<Product> allProducts = productRepository.findAll();
            List<Product> availableProducts = allProducts.stream()
                .filter(product -> product.getQuantity() > 0)
                .collect(Collectors.toList());

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalAvailableProducts", availableProducts.size());
            stats.put("totalCategories", availableProducts.stream()
                .map(Product::getCategory)
                .distinct()
                .count());
            stats.put("averagePrice", availableProducts.stream()
                .mapToDouble(Product::getPrice)
                .average()
                .orElse(0.0));
            stats.put("lowestPrice", availableProducts.stream()
                .mapToDouble(Product::getPrice)
                .min()
                .orElse(0.0));
            stats.put("highestPrice", availableProducts.stream()
                .mapToDouble(Product::getPrice)
                .max()
                .orElse(0.0));

            // These will be replaced with real data when order system is implemented
            stats.put("totalOrders", 0);
            stats.put("totalSpent", 0.0);
            stats.put("favoriteProducts", 0);
            stats.put("activeOrders", 0);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> errorStats = new HashMap<>();
            errorStats.put("error", "Could not fetch stats");
            return ResponseEntity.status(500).body(errorStats);
        }
    }

    /**
     * Convert Product entity to buyer-friendly format
     */
    private Map<String, Object> convertProductToBuyerFormat(Product product) {
        Map<String, Object> productMap = new HashMap<>();
        productMap.put("id", product.getId());
        productMap.put("name", product.getName());
        productMap.put("description", product.getDescription());
        productMap.put("price", product.getPrice());
        productMap.put("availableQuantity", product.getQuantity());
        productMap.put("category", product.getCategory());
        productMap.put("farmerId", product.getFarmerId());
        
        // Extract farmer name from email (temporary until farmer name lookup is implemented)
        String farmerName = extractFarmerNameFromId(product.getFarmerId());
        productMap.put("farmerName", farmerName);
        
        // Add stock status
        String stockStatus;
        if (product.getQuantity() == 0) {
            stockStatus = "Out of Stock";
        } else if (product.getQuantity() < 10) {
            stockStatus = "Low Stock";
        } else {
            stockStatus = "In Stock";
        }
        productMap.put("stockStatus", stockStatus);
        
        // Add image if available
        if (product.getImageBase64() != null && !product.getImageBase64().isEmpty()) {
            productMap.put("hasImage", true);
            productMap.put("imageBase64", product.getImageBase64());
        } else {
            productMap.put("hasImage", false);
            productMap.put("imageBase64", null);
        }
        
        return productMap;
    }

    /**
     * Extract farmer name from farmer ID (email) - temporary solution
     */
    private String extractFarmerNameFromId(String farmerId) {
        if (farmerId == null) return "Unknown Farmer";
        
        // Simple extraction from email
        if (farmerId.contains("@")) {
            String localPart = farmerId.substring(0, farmerId.indexOf("@"));
            String[] parts = localPart.replace(".", " ").replace("_", " ").split(" ");
            StringBuilder result = new StringBuilder();
            for (String part : parts) {
                if (!part.isEmpty()) {
                    result.append(Character.toUpperCase(part.charAt(0)))
                          .append(part.substring(1).toLowerCase())
                          .append(" ");
                }
            }
            return result.toString().trim();
        }
        
        return farmerId;
    }
}
