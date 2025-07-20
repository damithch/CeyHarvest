package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * CartItem entity representing individual items in a shopping cart
 */
@Document(collection = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    @Id
    private String id;
    
    /**
     * Reference to the cart this item belongs to
     */
    private String cartId;
    
    /**
     * Reference to the product being added to cart
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
     * Product price at the time of adding to cart
     */
    private double productPrice;
    
    /**
     * Quantity of this product in the cart
     */
    private int quantity;
    
    /**
     * Total amount for this cart item (price * quantity)
     */
    private double totalAmount;
    
    /**
     * Product category (cached for filtering)
     */
    private String category;
    
    /**
     * Product image base64 (cached for display)
     */
    private String imageBase64;
    
    /**
     * When this item was added to cart
     */
    private LocalDateTime addedAt;
    
    /**
     * When this item was last updated
     */
    private LocalDateTime updatedAt;
}
