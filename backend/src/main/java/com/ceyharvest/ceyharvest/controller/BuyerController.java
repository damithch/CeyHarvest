package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.repository.OrderRepository;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/buyer/{buyerId}")
public class BuyerController {
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;

    // Get all available products for buyer to purchase
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAvailableProducts(@PathVariable String buyerId) {
        // Buyers can see all products from all farmers
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(products);
    }

    // Get buyer's orders (find by buyer's email since Order uses customerEmail)
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getBuyerOrders(@PathVariable String buyerId) {
        // Note: This assumes buyerId is the buyer's email
        // If buyerId is the actual ID, you'll need to get the buyer's email first
        List<Order> orders = orderRepository.findByCustomerEmail(buyerId);
        return ResponseEntity.ok(orders);
    }

    // Get buyer statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getBuyerStats(@PathVariable String buyerId) {
        List<Order> orders = orderRepository.findByCustomerEmail(buyerId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orders.size());
        stats.put("totalSpent", orders.stream()
            .mapToDouble(Order::getTotalPrice)
            .sum());
        stats.put("favoriteProducts", 0); // Could be calculated based on order frequency
        stats.put("activeOrders", orders.stream()
            .filter(order -> "PENDING".equals(order.getStatus()) || "PROCESSING".equals(order.getStatus()))
            .count());
        
        return ResponseEntity.ok(stats);
    }
}
