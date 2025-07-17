package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private int quantity;
    private String category;
    private String imageBase64;
}