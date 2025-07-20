package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Cart entity for shopping cart functionality
 * Each buyer can have one cart with multiple cart items
 */
@Document(collection = "carts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    @Id
    private String id;
    
    /**
     * Email of the buyer who owns this cart
     */
    private String buyerEmail;
    
    /**
     * Total amount for all items in the cart
     */
    private double totalAmount;
    
    /**
     * Total number of items in the cart
     */
    private int totalItems;
    
    /**
     * Cart creation timestamp
     */
    private LocalDateTime createdAt;
    
    /**
     * Cart last updated timestamp
     */
    private LocalDateTime updatedAt;
    
    /**
     * Cart status (ACTIVE, CHECKED_OUT, ABANDONED)
     */
    private String status = "ACTIVE";
}
