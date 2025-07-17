package com.ceyharvest.ceyharvest.controller;

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