package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    private String id;
    private String farmerId;
    private String productId;
    private String customerEmail;
    private int quantity;
    private double totalPrice;
    private String status;
    private String orderDate;
}