package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.dto.ProductRequestDTO;
import com.ceyharvest.ceyharvest.dto.ProductResponseDTO;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public ProductResponseDTO addProduct(String farmerId, ProductRequestDTO requestDTO) {
        Product product = new Product();
        product.setFarmerId(farmerId);
        product.setName(requestDTO.getProductName());
        product.setGrade(requestDTO.getGrade());
        product.setLocation(requestDTO.getLocation());
        product.setQuantity(requestDTO.getQuantity());
        product.setPrice(requestDTO.getPrice());
        product.setHarvestDate(requestDTO.getHarvestDate());
        product.setDescription(requestDTO.getDescription());
        product.setCategory("Agricultural"); // Default category
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        product.setActive(true);
        
        Product savedProduct = productRepository.save(product);
        return convertToResponseDTO(savedProduct);
    }
    
    public ProductResponseDTO updateProduct(String farmerId, String productId, ProductRequestDTO requestDTO) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        if (existingProduct.isEmpty() || !existingProduct.get().getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Product not found or access denied");
        }
        
        Product product = existingProduct.get();
        product.setName(requestDTO.getProductName());
        product.setGrade(requestDTO.getGrade());
        product.setLocation(requestDTO.getLocation());
        product.setQuantity(requestDTO.getQuantity());
        product.setPrice(requestDTO.getPrice());
        product.setHarvestDate(requestDTO.getHarvestDate());
        product.setDescription(requestDTO.getDescription());
        product.setUpdatedAt(LocalDateTime.now());
        
        Product updatedProduct = productRepository.save(product);
        return convertToResponseDTO(updatedProduct);
    }
    
    public void deleteProduct(String farmerId, String productId) {
        Optional<Product> existingProduct = productRepository.findById(productId);
        if (existingProduct.isEmpty() || !existingProduct.get().getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Product not found or access denied");
        }
        productRepository.deleteById(productId);
    }
    
    public List<ProductResponseDTO> getFarmerProducts(String farmerId) {
        List<Product> products = productRepository.findByFarmerId(farmerId);
        return products.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    public ProductResponseDTO getProduct(String farmerId, String productId) {
        Optional<Product> product = productRepository.findById(productId);
        if (product.isPresent() && product.get().getFarmerId().equals(farmerId)) {
            return convertToResponseDTO(product.get());
        }
        throw new RuntimeException("Product not found or access denied");
    }
    
    public List<ProductResponseDTO> getAllActiveProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .filter(Product::isActive)
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    private ProductResponseDTO convertToResponseDTO(Product product) {
        return new ProductResponseDTO(
                product.getId(),
                product.getFarmerId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getQuantity(),
                product.getCategory(),
                product.getGrade(),
                product.getLocation(),
                product.getHarvestDate(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                product.isActive(),
                product.getImageBase64()
        );
    }
} 