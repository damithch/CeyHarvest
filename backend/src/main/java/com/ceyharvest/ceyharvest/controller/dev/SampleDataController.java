package com.ceyharvest.ceyharvest.controller.dev;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/dev")
public class SampleDataController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/sample-data/create")
    public ResponseEntity<?> createSampleData() {
        try {
            Map<String, Object> response = new HashMap<>();
            List<String> createdFarmers = new ArrayList<>();
            List<String> createdProducts = new ArrayList<>();

            // Create sample farmers
            List<Farmer> sampleFarmers = createSampleFarmers();
            for (Farmer farmer : sampleFarmers) {
                if (farmerRepository.findByEmail(farmer.getEmail()).isEmpty()) {
                    Farmer savedFarmer = farmerRepository.save(farmer);
                    createdFarmers.add(savedFarmer.getEmail());
                }
            }

            // Create sample products
            List<Product> sampleProducts = createSampleProducts();
            for (Product product : sampleProducts) {
                List<Product> existingProducts = productRepository.findByFarmerId(product.getFarmerId());
                boolean productExists = existingProducts.stream()
                        .anyMatch(p -> p.getProductName().equals(product.getProductName()));

                if (!productExists) {
                    Product savedProduct = productRepository.save(product);
                    createdProducts.add(savedProduct.getProductName());
                }
            }

            response.put("message", "Sample data created successfully");
            response.put("farmersCreated", createdFarmers);
            response.put("productsCreated", createdProducts);
            response.put("totalProducts", createdProducts.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("error", "Failed to create sample data", "message", e.getMessage()));
        }
    }

    @GetMapping("/sample-data/products")
    public ResponseEntity<List<Product>> getAllSampleProducts() {
        try {
            return ResponseEntity.ok(productRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @DeleteMapping("/sample-data/products")
    public ResponseEntity<?> clearSampleProducts() {
        try {
            long deletedCount = productRepository.count();
            productRepository.deleteAll();
            return ResponseEntity.ok(
                    Map.of("message", "Sample products cleared", "deletedCount", deletedCount));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("error", "Error clearing sample products", "message", e.getMessage()));
        }
    }

    private List<Farmer> createSampleFarmers() {
        List<Farmer> farmers = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        Farmer farmer1 = new Farmer();
        farmer1.setUsername("john_veggie_farm");
        farmer1.setFirstName("John");
        farmer1.setLastName("Silva");
        farmer1.setEmail("john.silva@samplefarm.lk");
        farmer1.setPhoneNumber("0771234567");
        farmer1.setPassword(passwordEncoder.encode("farmer123"));
        farmer1.setRole("FARMER");
        farmer1.setAddress("123 Farm Road, Nuwara Eliya");
        farmer1.setCity("Nuwara Eliya");
        farmer1.setPostalCode("22200");
        farmer1.setEmailVerified(true);
        farmer1.setCreatedAt(now);
        farmer1.setUpdatedAt(now);
        farmers.add(farmer1);

        Farmer farmer2 = new Farmer();
        farmer2.setUsername("mary_fruit_garden");
        farmer2.setFirstName("Mary");
        farmer2.setLastName("Fernando");
        farmer2.setEmail("mary.fernando@fruitgarden.lk");
        farmer2.setPhoneNumber("0779876543");
        farmer2.setPassword(passwordEncoder.encode("farmer123"));
        farmer2.setRole("FARMER");
        farmer2.setAddress("456 Orchard Lane, Kandy");
        farmer2.setCity("Kandy");
        farmer2.setPostalCode("20000");
        farmer2.setEmailVerified(true);
        farmer2.setCreatedAt(now);
        farmer2.setUpdatedAt(now);
        farmers.add(farmer2);

        return farmers;
    }

    private List<Product> createSampleProducts() {
        List<Product> products = new ArrayList<>();
        String farmer1Id = "john.silva@samplefarm.lk";
        String farmer2Id = "mary.fernando@fruitgarden.lk";

        // Vegetables from Farmer 1
        products.add(createProduct(farmer1Id, "Fresh Carrots", "Nuwara Eliya", 150.0, 50, LocalDate.now().plusDays(5), 14));
        products.add(createProduct(farmer1Id, "Green Beans", "Nuwara Eliya", 120.0, 30, LocalDate.now().plusDays(3), 7));
        products.add(createProduct(farmer1Id, "Cabbage", "Nuwara Eliya", 80.0, 25, LocalDate.now().plusDays(7), 21));

        // Fruits from Farmer 2
        products.add(createProduct(farmer2Id, "King Coconuts", "Kandy", 50.0, 100, LocalDate.now().plusDays(14), 30));
        products.add(createProduct(farmer2Id, "Bananas", "Kandy", 180.0, 60, LocalDate.now().plusDays(2), 5));
        products.add(createProduct(farmer2Id, "Mangoes", "Kandy", 300.0, 25, LocalDate.now().plusDays(1), 7));

        return products;
    }

    private Product createProduct(String farmerId, String productName, String location,
                                  double latestPrice, int totalStock, LocalDate harvestDay, int shelfLife) {
        Product product = new Product();
        product.setFarmerId(farmerId);
        product.setProductName(productName);
        product.setLocation(location);
        product.setLatestPrice(latestPrice);
        product.setTotalStock(totalStock);
        product.setHarvestDay(harvestDay);
        product.setShelfLife(shelfLife);
        product.setCreatedAt(LocalDateTime.now());
        return product;
    }
}