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

    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getAllProducts(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") double minPrice,
            @RequestParam(defaultValue = "999999") double maxPrice) {

        try {
            List<Product> products = productRepository.findAll();

            List<Product> availableProducts = products.stream()
                    .filter(product -> product.getTotalStock() > 0)
                    .collect(Collectors.toList());

            if (location != null && !location.trim().isEmpty()) {
                availableProducts = availableProducts.stream()
                        .filter(product -> product.getLocation().equalsIgnoreCase(location))
                        .collect(Collectors.toList());
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                availableProducts = availableProducts.stream()
                        .filter(product ->
                                product.getProductName().toLowerCase().contains(searchLower) ||
                                        product.getLocation().toLowerCase().contains(searchLower))
                        .collect(Collectors.toList());
            }

            availableProducts = availableProducts.stream()
                    .filter(product -> product.getLatestPrice() >= minPrice && product.getLatestPrice() <= maxPrice)
                    .collect(Collectors.toList());

            List<Map<String, Object>> productResponse = availableProducts.stream()
                    .map(this::convertProductToBuyerFormat)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(productResponse);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable String productId) {
        try {
            Optional<Product> productOpt = productRepository.findById(productId);

            if (productOpt.isPresent()) {
                Product product = productOpt.get();

                if (product.getTotalStock() <= 0) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("error", "Product is out of stock");
                    response.put("productId", productId);
                    return ResponseEntity.status(410).body(response);
                }

                return ResponseEntity.ok(convertProductToBuyerFormat(product));
            }
            return ResponseEntity.status(404).body("Product not found");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving product: " + e.getMessage());
        }
    }

    @GetMapping("/products/location/{location}")
    public ResponseEntity<List<Map<String, Object>>> getProductsByLocation(@PathVariable String location) {
        try {
            List<Product> products = productRepository.findAll().stream()
                    .filter(product -> product.getTotalStock() > 0 &&
                            product.getLocation().equalsIgnoreCase(location))
                    .collect(Collectors.toList());

            List<Map<String, Object>> productResponse = products.stream()
                    .map(this::convertProductToBuyerFormat)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(productResponse);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/locations")
    public ResponseEntity<List<String>> getLocations() {
        try {
            List<String> locations = productRepository.findAll().stream()
                    .filter(product -> product.getTotalStock() > 0)
                    .map(Product::getLocation)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());

            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/{buyerEmail}/stats")
    public ResponseEntity<Map<String, Object>> getBuyerStats(@PathVariable String buyerEmail) {
        try {
            List<Product> availableProducts = productRepository.findAll().stream()
                    .filter(product -> product.getTotalStock() > 0)
                    .collect(Collectors.toList());

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalAvailableProducts", availableProducts.size());
            stats.put("totalLocations", availableProducts.stream()
                    .map(Product::getLocation)
                    .distinct()
                    .count());
            stats.put("averagePrice", availableProducts.stream()
                    .mapToDouble(Product::getLatestPrice)
                    .average()
                    .orElse(0.0));
            stats.put("lowestPrice", availableProducts.stream()
                    .mapToDouble(Product::getLatestPrice)
                    .min()
                    .orElse(0.0));
            stats.put("highestPrice", availableProducts.stream()
                    .mapToDouble(Product::getLatestPrice)
                    .max()
                    .orElse(0.0));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> errorStats = new HashMap<>();
            errorStats.put("error", "Could not fetch stats");
            return ResponseEntity.status(500).body(errorStats);
        }
    }

    private Map<String, Object> convertProductToBuyerFormat(Product product) {
        Map<String, Object> productMap = new HashMap<>();
        productMap.put("id", product.getId());
        productMap.put("productName", product.getProductName());
        productMap.put("location", product.getLocation());
        productMap.put("totalStock", product.getTotalStock());
        productMap.put("latestPrice", product.getLatestPrice());
        productMap.put("harvestDay", product.getHarvestDay());
        productMap.put("shelfLife", product.getShelfLife());
        productMap.put("farmerId", product.getFarmerId());

        String stockStatus = product.getTotalStock() == 0 ? "Out of Stock" :
                product.getTotalStock() < 10 ? "Low Stock" : "In Stock";
        productMap.put("stockStatus", stockStatus);

        return productMap;
    }
}