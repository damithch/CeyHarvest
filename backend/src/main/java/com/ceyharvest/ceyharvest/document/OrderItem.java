package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * OrderItem entity representing individual items in an order
 */
@Document(collection = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    private String id;
    
    /**
     * Reference to the order this item belongs to
     */
    private String orderId;
    
    /**
     * Reference to the product
     */
    private String productId;
    
    /**
     * Email of the farmer who owns the product
     */
    private String farmerId;
    
    /**
     * Product name (cached for performance)
     */
    private String productName;
    
    /**
     * Product price at the time of order
     */
    private double productPrice;
    
    /**
     * Quantity ordered
     */
    private int quantity;
    
    /**
     * Total amount for this order item (price * quantity)
     */
    private double totalAmount;
    
    /**
     * Product category (cached for reporting)
     */
    private String category;
    
    /**
     * Product image base64 (cached for order history)
     */
    private String imageBase64;
    
    /**
     * Item status (PENDING, CONFIRMED, SHIPPED, DELIVERED)
     */
    private String status = "PENDING";
    
    /**
     * When this item was added to order
     */
    private LocalDateTime createdAt;
    
    /**
     * When this item was last updated
     */
    private LocalDateTime updatedAt;
}
