package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    private String id;
    private String farmerId;
    private String name;
    private String description;
    private double price;
    private double quantity; // Changed to double to support decimal quantities
    private String category;
    private String imageBase64;
    
    // New fields from AddProductForm
    private String grade; // A, B, C
    private String location; // e.g., Polonnaruwa, Anuradhapura
    private LocalDate harvestDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive = true; // To mark products as active/inactive
}