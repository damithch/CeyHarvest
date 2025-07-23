package com.ceyharvest.ceyharvest.controller.buyer;

import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.document.OrderItem;
import com.ceyharvest.ceyharvest.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for buyer order management
 */
@RestController
@RequestMapping("/api/buyer")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Get buyer's orders
     */
    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getBuyerOrders(Authentication authentication) {
        try {
            String buyerEmail = authentication.getName();
            List<Order> orders = orderService.getOrdersByCustomer(buyerEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orders", orders);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get specific order details with items
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrderDetails(
            @PathVariable String orderId,
            Authentication authentication) {
        try {
            String buyerEmail = authentication.getName();
            
            // Get order and verify it belongs to the buyer
            Order order = orderService.getOrderWithItems(orderId);
            if (order == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Order not found");
                return ResponseEntity.notFound().build();
            }
            
            if (!order.getCustomerEmail().equals(buyerEmail)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Unauthorized access to order");
                return ResponseEntity.status(403).body(response);
            }
            
            // Get order items
            List<OrderItem> orderItems = orderService.getOrderItems(orderId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", order);
            response.put("orderItems", orderItems);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Cancel an order (if it's still in PENDING status)
     */
    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(
            @PathVariable String orderId,
            Authentication authentication) {
        try {
            String buyerEmail = authentication.getName();
            
            // Get order and verify it belongs to the buyer
            Order order = orderService.getOrderWithItems(orderId);
            if (order == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Order not found");
                return ResponseEntity.notFound().build();
            }
            
            if (!order.getCustomerEmail().equals(buyerEmail)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Unauthorized access to order");
                return ResponseEntity.status(403).body(response);
            }
            
            // Check if order can be cancelled
            if (!"PENDING".equals(order.getStatus())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Order cannot be cancelled in current status: " + order.getStatus());
                return ResponseEntity.badRequest().body(response);
            }
            
            // Cancel the order
            Order cancelledOrder = orderService.cancelOrder(orderId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", cancelledOrder);
            response.put("message", "Order cancelled successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
