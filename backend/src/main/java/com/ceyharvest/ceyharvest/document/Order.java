package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    private String id;
    
    /**
     * Email of the customer who placed the order
     */
    private String customerEmail;
    
    /**
     * Total order amount
     */
    private double totalAmount;
    
    /**
     * Order status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
     */
    private String status = "PENDING";
    
    /**
     * Payment status (PENDING, PAID, FAILED, REFUNDED)
     */
    private String paymentStatus = "PENDING";
    
    /**
     * Payment ID reference
     */
    private String paymentId;
    
    /**
     * Delivery address for the order
     */
    private String deliveryAddress;
    
    /**
     * Delivery city
     */
    private String deliveryCity;
    
    /**
     * Delivery postal code
     */
    private String deliveryPostalCode;
    
    /**
     * Contact phone number for delivery
     */
    private String contactPhone;
    
    /**
     * Order creation timestamp
     */
    private LocalDateTime createdAt;
    
    /**
     * Order last updated timestamp
     */
    private LocalDateTime updatedAt;
    
    /**
     * Expected delivery date
     */
    private LocalDateTime expectedDeliveryDate;
    
    /**
     * Special instructions for the order
     */
    private String instructions;
    
    // Legacy fields - keeping for backward compatibility
    private String farmerId; // Will be removed when we fully migrate
    private String productId; // Will be removed when we fully migrate  
    private int quantity; // Will be removed when we fully migrate
    private double totalPrice; // Will be removed when we fully migrate
    private String orderDate; // Will be removed when we fully migrate
}