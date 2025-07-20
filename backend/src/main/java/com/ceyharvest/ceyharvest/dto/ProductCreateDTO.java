package com.ceyharvest.ceyharvest.dto;

import lombok.Data;

@Data
public class ProductCreateDTO {
    private String productName;
    private String grade;
    private String location;
    private double quantity;
    private double price;
    private String harvestDate;
    private String description;
} 