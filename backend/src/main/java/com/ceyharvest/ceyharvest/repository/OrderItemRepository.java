package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.OrderItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Repository interface for OrderItem entity operations
 */
public interface OrderItemRepository extends MongoRepository<OrderItem, String> {
    
    /**
     * Find all order items for a specific order
     * @param orderId ID of the order
     * @return List of order items
     */
    List<OrderItem> findByOrderId(String orderId);
    
    /**
     * Find order items by farmer ID
     * @param farmerId Email of the farmer
     * @return List of order items
     */
    List<OrderItem> findByFarmerId(String farmerId);
    
    /**
     * Find order items by product ID
     * @param productId ID of the product
     * @return List of order items
     */
    List<OrderItem> findByProductId(String productId);
    
    /**
     * Delete all order items for a specific order
     * @param orderId ID of the order
     */
    void deleteByOrderId(String orderId);
    
    /**
     * Count order items in an order
     * @param orderId ID of the order
     * @return Number of items
     */
    long countByOrderId(String orderId);
}
