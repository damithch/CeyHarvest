package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.dto.ProductRequestDTO;
import com.ceyharvest.ceyharvest.dto.ProductResponseDTO;
import com.ceyharvest.ceyharvest.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/farmer/{farmerId}/products")
@CrossOrigin(origins = "*")
public class FarmerProductController {
    
    @Autowired
    private ProductService productService;

    // Add Product with JSON data (for AddProductForm)
    @PostMapping(consumes = {"application/json"})
    public ResponseEntity<?> addProduct(
            @PathVariable String farmerId,
            @RequestBody ProductRequestDTO productRequest
    ) {
        try {
            ProductResponseDTO savedProduct = productService.addProduct(farmerId, productRequest);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding product: " + e.getMessage());
        }
    }

    // Add Product with image upload (legacy endpoint)
    @PostMapping(value = "/with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<?> addProductWithImage(
            @PathVariable String farmerId,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam double quantity,
            @RequestParam String category,
            @RequestParam(value = "grade", defaultValue = "A") String grade,
            @RequestParam(value = "location", defaultValue = "") String location,
            @RequestParam(value = "harvestDate", required = false) String harvestDate,
            @RequestParam("image") MultipartFile image
    ) throws IOException {
        try {
            ProductRequestDTO productRequest = new ProductRequestDTO();
            productRequest.setProductName(name);
            productRequest.setDescription(description);
            productRequest.setPrice(price);
            productRequest.setQuantity(quantity);
            productRequest.setGrade(grade);
            productRequest.setLocation(location);
            // Note: harvestDate would need to be parsed from String to LocalDate
            
            ProductResponseDTO savedProduct = productService.addProduct(farmerId, productRequest);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding product: " + e.getMessage());
        }
    }

    // Update Product with JSON data
    @PutMapping(value = "/{productId}", consumes = {"application/json"})
    public ResponseEntity<?> updateProduct(
            @PathVariable String farmerId,
            @PathVariable String productId,
            @RequestBody ProductRequestDTO productRequest
    ) {
        try {
            ProductResponseDTO updatedProduct = productService.updateProduct(farmerId, productId, productRequest);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating product: " + e.getMessage());
        }
    }

    // Update Product with image upload (legacy endpoint)
    @PutMapping(value = "/{productId}/with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProductWithImage(
            @PathVariable String farmerId,
            @PathVariable String productId,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam double quantity,
            @RequestParam String category,
            @RequestParam(value = "grade", defaultValue = "A") String grade,
            @RequestParam(value = "location", defaultValue = "") String location,
            @RequestParam(value = "harvestDate", required = false) String harvestDate,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        try {
            ProductRequestDTO productRequest = new ProductRequestDTO();
            productRequest.setProductName(name);
            productRequest.setDescription(description);
            productRequest.setPrice(price);
            productRequest.setQuantity(quantity);
            productRequest.setGrade(grade);
            productRequest.setLocation(location);
            // Note: harvestDate would need to be parsed from String to LocalDate
            
            ProductResponseDTO updatedProduct = productService.updateProduct(farmerId, productId, productRequest);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating product: " + e.getMessage());
        }
    }

    // Delete Product
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable String farmerId, @PathVariable String productId) {
        try {
            productService.deleteProduct(farmerId, productId);
            return ResponseEntity.ok().body("Product deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting product: " + e.getMessage());
        }
    }

    // List All Products for Farmer
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> listProducts(@PathVariable String farmerId) {
        try {
            List<ProductResponseDTO> products = productService.getFarmerProducts(farmerId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get Product by ID
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable String farmerId, @PathVariable String productId) {
        try {
            ProductResponseDTO product = productService.getProduct(farmerId, productId);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Get all active products (for buyers to browse)
    @GetMapping("/all/active")
    public ResponseEntity<List<ProductResponseDTO>> getAllActiveProducts() {
        try {
            List<ProductResponseDTO> products = productService.getAllActiveProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 