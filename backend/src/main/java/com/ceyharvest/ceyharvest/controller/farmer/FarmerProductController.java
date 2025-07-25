package com.ceyharvest.ceyharvest.controller.farmer;

import com.ceyharvest.ceyharvest.document.Product;
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
            @RequestParam(required = false) String description, // Not used
            @RequestParam double price,
            @RequestParam int quantity,
            @RequestParam(required = false) String category, // Not used
            @RequestParam(value = "image", required = false) MultipartFile image // Not used
    ) throws IOException {
        Product product = new Product();
        product.setId(null);
        product.setFarmerId(farmerId);
        product.setProductName(name);
        product.setLatestPrice(price);
        product.setTotalStock(quantity);
        // description, category, imageBase64 are not present in Product class
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    // Update Product with image upload
    @PutMapping(value = "/{productId}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProduct(
            @PathVariable String farmerId,
            @PathVariable String productId,
            @RequestParam String name,
            @RequestParam(required = false) String description, // Not used
            @RequestParam double price,
            @RequestParam int quantity,
            @RequestParam(required = false) String category, // Not used
            @RequestParam(value = "image", required = false) MultipartFile image // Not used
    ) throws IOException {
        Optional<Product> existing = productRepository.findById(productId);
        if (existing.isEmpty() || !existing.get().getFarmerId().equals(farmerId)) {
            return ResponseEntity.notFound().build();
        }
        Product toUpdate = existing.get();
        toUpdate.setProductName(name);
        toUpdate.setLatestPrice(price);
        toUpdate.setTotalStock(quantity);
        // description, category, imageBase64 are not present in Product class
        Product updated = productRepository.save(toUpdate);
        return ResponseEntity.ok(updated);
    }

    // Delete Product
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable String farmerId, @PathVariable String productId) {
        Optional<Product> existing = productRepository.findById(productId);
        if (existing.isEmpty() || !existing.get().getFarmerId().equals(farmerId)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(productId);
        return ResponseEntity.ok().build();
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
}
