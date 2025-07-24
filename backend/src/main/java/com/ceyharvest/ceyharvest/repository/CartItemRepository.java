package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for CartItem entity operations
 */
public interface CartItemRepository extends MongoRepository<CartItem, String> {
    
    /**
     * Find all cart items for a specific cart
     * @param cartId ID of the cart
     * @return List of cart items
     */
    List<CartItem> findByCartId(String cartId);
    
    /**
     * Find specific cart item by cart and product
     * @param cartId ID of the cart
     * @param productId ID of the product
     * @return Optional CartItem if found
     */
    Optional<CartItem> findByCartIdAndProductId(String cartId, String productId);
    
    /**
     * Delete all cart items for a specific cart
     * @param cartId ID of the cart
     */
    void deleteByCartId(String cartId);
    
    /**
     * Delete specific cart item by cart and product
     * @param cartId ID of the cart
     * @param productId ID of the product
     */
    void deleteByCartIdAndProductId(String cartId, String productId);
    
    /**
     * Count total items in a cart
     * @param cartId ID of the cart
     * @return Number of items
     */
    long countByCartId(String cartId);
}
