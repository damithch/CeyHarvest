package com.ceyharvest.ceyharvest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDTO {
    private String productName;
    private String grade;
    private String location;
    private double quantity;
    private double price;
    private LocalDate harvestDate;
    private String description;
} 