package com.ceyharvest.ceyharvest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {
    private String id;
    private String farmerId;
    private String name;
    private String description;
    private double price;
    private double quantity;
    private String category;
    private String grade;
    private String location;
    private LocalDate harvestDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive;
    private String imageBase64;
} 