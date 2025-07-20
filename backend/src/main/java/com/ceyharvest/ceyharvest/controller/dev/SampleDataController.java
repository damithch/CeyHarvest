package com.ceyharvest.ceyharvest.controller.dev;

import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Development controller for creating sample data
 * This controller should be removed in production
 */
@RestController
@RequestMapping("/api/dev")
public class SampleDataController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create sample farmers and products for payment gateway testing
     * This endpoint creates realistic sample data for development purposes
     */
    @PostMapping("/sample-data/create")
    public ResponseEntity<?> createSampleData() {
        try {
            Map<String, Object> response = new HashMap<>();
            List<String> createdFarmers = new ArrayList<>();
            List<String> createdProducts = new ArrayList<>();

            // Create sample farmers first
            List<Farmer> sampleFarmers = createSampleFarmers();
            for (Farmer farmer : sampleFarmers) {
                // Check if farmer already exists
                if (farmerRepository.findByEmail(farmer.getEmail()).isEmpty()) {
                    Farmer savedFarmer = farmerRepository.save(farmer);
                    createdFarmers.add(savedFarmer.getEmail());
                }
            }

            // Create sample products
            List<Product> sampleProducts = createSampleProducts();
            for (Product product : sampleProducts) {
                Product savedProduct = productRepository.save(product);
                createdProducts.add(savedProduct.getName());
            }

            response.put("message", "Sample data created successfully");
            response.put("farmersCreated", createdFarmers);
            response.put("productsCreated", createdProducts);
            response.put("totalProducts", createdProducts.size());
            response.put("note", "This is development data - remove in production");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create sample data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Get all sample products for testing
     */
    @GetMapping("/sample-data/products")
    public ResponseEntity<List<Product>> getAllSampleProducts() {
        try {
            List<Product> products = productRepository.findAll();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    /**
     * Clear all sample data (products only, keeps farmers for safety)
     */
    @DeleteMapping("/sample-data/products")
    public ResponseEntity<?> clearSampleProducts() {
        try {
            long deletedCount = productRepository.count();
            productRepository.deleteAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Sample products cleared");
            response.put("deletedCount", deletedCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error clearing sample products: " + e.getMessage());
        }
    }

    /**
     * Create sample farmers for product ownership
     */
    private List<Farmer> createSampleFarmers() {
        List<Farmer> farmers = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Farmer 1 - Vegetables specialist
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

        // Farmer 2 - Fruits specialist
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

        // Farmer 3 - Rice and grains
        Farmer farmer3 = new Farmer();
        farmer3.setUsername("rice_master_farm");
        farmer3.setFirstName("Kamal");
        farmer3.setLastName("Perera");
        farmer3.setEmail("kamal.perera@ricefarm.lk");
        farmer3.setPhoneNumber("0771111222");
        farmer3.setPassword(passwordEncoder.encode("farmer123"));
        farmer3.setRole("FARMER");
        farmer3.setAddress("789 Paddy Field Road, Anuradhapura");
        farmer3.setCity("Anuradhapura");
        farmer3.setPostalCode("50000");
        farmer3.setEmailVerified(true);
        farmer3.setCreatedAt(now);
        farmer3.setUpdatedAt(now);
        farmers.add(farmer3);

        return farmers;
    }

    /**
     * Create sample products with realistic Sri Lankan agricultural products
     */
    private List<Product> createSampleProducts() {
        List<Product> products = new ArrayList<>();

        // Get or create farmer IDs (we'll use email as farmerId for now)
        String farmer1Id = "john.silva@samplefarm.lk";
        String farmer2Id = "mary.fernando@fruitgarden.lk";
        String farmer3Id = "kamal.perera@ricefarm.lk";

        // Vegetables from Farmer 1
        products.add(createProduct(farmer1Id, "Fresh Carrots", "Organically grown carrots from Nuwara Eliya highlands", 150.0, 50, "Vegetables"));
        products.add(createProduct(farmer1Id, "Green Beans", "Fresh green beans, perfect for stir-fry", 120.0, 30, "Vegetables"));
        products.add(createProduct(farmer1Id, "Cabbage", "Large fresh cabbage heads", 80.0, 25, "Vegetables"));
        products.add(createProduct(farmer1Id, "Tomatoes", "Juicy red tomatoes, perfect for cooking", 200.0, 40, "Vegetables"));
        products.add(createProduct(farmer1Id, "Lettuce", "Fresh leafy lettuce for salads", 100.0, 20, "Vegetables"));

        // Fruits from Farmer 2
        products.add(createProduct(farmer2Id, "King Coconuts", "Fresh king coconuts from Kandy", 50.0, 100, "Fruits"));
        products.add(createProduct(farmer2Id, "Bananas", "Sweet Cavendish bananas", 180.0, 60, "Fruits"));
        products.add(createProduct(farmer2Id, "Mangoes", "Juicy Alphonso mangoes", 300.0, 25, "Fruits"));
        products.add(createProduct(farmer2Id, "Papayas", "Ripe papayas, ready to eat", 120.0, 35, "Fruits"));
        products.add(createProduct(farmer2Id, "Pineapples", "Sweet golden pineapples", 250.0, 15, "Fruits"));

        // Rice and grains from Farmer 3
        products.add(createProduct(farmer3Id, "Basmati Rice", "Premium quality basmati rice", 220.0, 100, "Grains"));
        products.add(createProduct(farmer3Id, "Red Rice", "Nutritious red rice from Anuradhapura", 180.0, 80, "Grains"));
        products.add(createProduct(farmer3Id, "White Rice", "Traditional white rice", 160.0, 120, "Grains"));
        products.add(createProduct(farmer3Id, "Green Gram", "High-quality green gram lentils", 280.0, 50, "Grains"));
        products.add(createProduct(farmer3Id, "Black Gram", "Premium black gram lentils", 320.0, 40, "Grains"));

        return products;
    }

    /**
     * Helper method to create a product
     */
    private Product createProduct(String farmerId, String name, String description, double price, int quantity, String category) {
        Product product = new Product();
        product.setFarmerId(farmerId);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setQuantity(quantity);
        product.setCategory(category);
        // We'll skip images for now to keep it simple
        product.setImageBase64(null);
        return product;
    }
}
