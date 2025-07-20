package com.ceyharvest.ceyharvest.controller.farmer;

import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.dto.ProductCreateDTO;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/farmer/{farmerId}/products")
public class FarmerProductController {
    @Autowired
    private ProductRepository productRepository;

    // Add Product with image upload
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> addProduct(
            @PathVariable String farmerId,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam int quantity,
            @RequestParam String category,
            @RequestParam("image") MultipartFile image
    ) throws IOException {
        Product product = new Product();
        product.setId(null);
        product.setFarmerId(farmerId);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setQuantity(quantity);
        product.setCategory(category);
        if (image != null && !image.isEmpty()) {
            product.setImageBase64(Base64.getEncoder().encodeToString(image.getBytes()));
        }
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    // Add Product with JSON data (for AddProductForm)
    @PostMapping(value = "/add", consumes = {"application/json"})
    public ResponseEntity<?> addProductJson(
            @PathVariable String farmerId,
            @RequestBody ProductCreateDTO productDTO
    ) {
        try {
            // Validate required fields
            if (productDTO.getProductName() == null || productDTO.getProductName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Product name is required");
            }
            if (productDTO.getLocation() == null || productDTO.getLocation().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Location is required");
            }
            if (productDTO.getQuantity() <= 0) {
                return ResponseEntity.badRequest().body("Quantity must be greater than 0");
            }
            if (productDTO.getPrice() <= 0) {
                return ResponseEntity.badRequest().body("Price must be greater than 0");
            }
            if (productDTO.getHarvestDate() == null || productDTO.getHarvestDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Harvest date is required");
            }
            
            Product product = new Product();
            product.setId(null);
            product.setFarmerId(farmerId);
            product.setName(productDTO.getProductName());
            product.setDescription(productDTO.getDescription() != null ? productDTO.getDescription() : "");
            product.setPrice(productDTO.getPrice());
            product.setQuantity((int) productDTO.getQuantity());
            product.setCategory("Agricultural"); // Default category
            product.setGrade(productDTO.getGrade());
            product.setLocation(productDTO.getLocation());
            product.setHarvestDate(productDTO.getHarvestDate());
            
            Product saved = productRepository.save(product);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to add product: " + e.getMessage());
        }
    }

    // Update Product with image upload
    @PutMapping(value = "/{productId}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProduct(
            @PathVariable String farmerId,
            @PathVariable String productId,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam int quantity,
            @RequestParam String category,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        Optional<Product> existing = productRepository.findById(productId);
        if (existing.isEmpty() || !existing.get().getFarmerId().equals(farmerId)) {
            return ResponseEntity.notFound().build();
        }
        Product toUpdate = existing.get();
        toUpdate.setName(name);
        toUpdate.setDescription(description);
        toUpdate.setPrice(price);
        toUpdate.setQuantity(quantity);
        toUpdate.setCategory(category);
        if (image != null && !image.isEmpty()) {
            toUpdate.setImageBase64(Base64.getEncoder().encodeToString(image.getBytes()));
        }
        Product updated = productRepository.save(toUpdate);
        return ResponseEntity.ok(updated);
    }

    // Update a single product entry by productId
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProductEntry(
            @PathVariable String farmerId,
            @PathVariable String productId,
            @RequestBody ProductCreateDTO productDTO
    ) {
        Optional<Product> existing = productRepository.findById(productId);
        if (existing.isEmpty() || !existing.get().getFarmerId().equals(farmerId)) {
            return ResponseEntity.notFound().build();
        }
        Product toUpdate = existing.get();
        toUpdate.setName(productDTO.getProductName());
        toUpdate.setDescription(productDTO.getDescription() != null ? productDTO.getDescription() : "");
        toUpdate.setPrice(productDTO.getPrice());
        toUpdate.setQuantity((int) productDTO.getQuantity());
        toUpdate.setGrade(productDTO.getGrade());
        toUpdate.setLocation(productDTO.getLocation());
        toUpdate.setHarvestDate(productDTO.getHarvestDate());
        Product updated = productRepository.save(toUpdate);
        return ResponseEntity.ok(updated);
    }

    // Delete Product
     /* 
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable String farmerId, @PathVariable String productId) {
        Optional<Product> existing = productRepository.findById(productId);
        if (existing.isEmpty() || !existing.get().getFarmerId().equals(farmerId)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(productId);
        return ResponseEntity.ok().build();
    }
       */   
    // Delete a single product entry by productId
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProductEntry(
            @PathVariable String farmerId,
            @PathVariable String productId
    ) {
        Optional<Product> existing = productRepository.findById(productId);
        if (existing.isEmpty() || !existing.get().getFarmerId().equals(farmerId)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(productId);
        return ResponseEntity.ok().body("Product entry deleted successfully");
    }

    // List All Products for Farmer
    @GetMapping
    public ResponseEntity<List<Product>> listProducts(@PathVariable String farmerId) {
        List<Product> products = productRepository.findByFarmerId(farmerId);
        return ResponseEntity.ok(products);
    }

    // Get Product by ID
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable String farmerId, @PathVariable String productId) {
        Optional<Product> product = productRepository.findById(productId);
        if (product.isPresent() && product.get().getFarmerId().equals(farmerId)) {
            return ResponseEntity.ok(product.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Get all products for a farmer by category (productName), sorted by harvestDate descending
    @GetMapping("/category/{productName}")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @PathVariable String farmerId,
            @PathVariable String productName
    ) {
        List<Product> products = productRepository.findByFarmerIdAndNameOrderByHarvestDateDesc(farmerId, productName);
        return ResponseEntity.ok(products);
    }

    // Delete all products for a farmer by category (productName)
    @DeleteMapping("/category/{productName}")
    public ResponseEntity<?> deleteCategory(
            @PathVariable String farmerId,
            @PathVariable String productName
    ) {
        productRepository.deleteByFarmerIdAndName(farmerId, productName);
        return ResponseEntity.ok().body("Category deleted successfully");
    }
}
