package com.ceyharvest.ceyharvest.controller.buyer;

import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.document.OrderItem;
import com.ceyharvest.ceyharvest.document.Payment;
import com.ceyharvest.ceyharvest.service.OrderService;
import com.ceyharvest.ceyharvest.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for checkout and payment processing
 */
@RestController
@RequestMapping("/api/buyer/checkout")
public class CheckoutController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    /**
     * Create order from cart and initialize payment
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        
        try {
            String buyerEmail = authentication.getName();
            
            // Create order from cart
            Order order = orderService.createOrderFromCart(
                buyerEmail,
                request.getDeliveryAddress(),
                request.getDeliveryCity(),
                request.getDeliveryPostalCode(),
                request.getContactPhone(),
                request.getInstructions()
            );
            
            // Get order items
            List<OrderItem> orderItems = orderService.getOrderItems(order.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", order);
            response.put("orderItems", orderItems);
            response.put("message", "Order created successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Create payment intent for order
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(
            @RequestBody PaymentIntentRequest request,
            Authentication authentication) {
        
        try {
            String buyerEmail = authentication.getName();
            
            // Create payment intent
            Map<String, Object> paymentIntent = paymentService.createStripePaymentIntent(
                request.getOrderId(),
                buyerEmail,
                request.getPaymentMethod()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentIntent", paymentIntent);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Process payment confirmation
     */
    @PostMapping("/confirm-payment")
    public ResponseEntity<Map<String, Object>> confirmPayment(
            @RequestBody ConfirmPaymentRequest request,
            Authentication authentication) {
        
        try {
            String buyerEmail = authentication.getName();
            
            // Process payment
            Payment payment = paymentService.processPayment(
                request.getPaymentIntentId(),
                request.getOrderId(),
                buyerEmail
            );
            
            // Update order payment status
            Order updatedOrder = orderService.updatePaymentStatus(
                request.getOrderId(),
                payment.getStatus(),
                payment.getId()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payment", payment);
            response.put("order", updatedOrder);
            response.put("message", "Payment processed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get order details with items
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrderDetails(
            @PathVariable String orderId,
            Authentication authentication) {
        
        try {
            Order order = orderService.getOrderWithItems(orderId);
            if (order == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Order not found");
                return ResponseEntity.notFound().build();
            }
            
            // Verify order belongs to this buyer
            if (!order.getCustomerEmail().equals(authentication.getName())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Access denied");
                return ResponseEntity.status(403).body(response);
            }
            
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
     * Cancel order
     */
    @PostMapping("/cancel-order/{orderId}")
    public ResponseEntity<Map<String, Object>> cancelOrder(
            @PathVariable String orderId,
            Authentication authentication) {
        
        try {
            Order order = orderService.getOrderWithItems(orderId);
            if (order == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Order not found");
                return ResponseEntity.notFound().build();
            }
            
            // Verify order belongs to this buyer
            if (!order.getCustomerEmail().equals(authentication.getName())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Access denied");
                return ResponseEntity.status(403).body(response);
            }
            
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

    // Request DTOs
    public static class CreateOrderRequest {
        private String deliveryAddress;
        private String deliveryCity;
        private String deliveryPostalCode;
        private String contactPhone;
        private String instructions;

        // Getters and setters
        public String getDeliveryAddress() { return deliveryAddress; }
        public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
        
        public String getDeliveryCity() { return deliveryCity; }
        public void setDeliveryCity(String deliveryCity) { this.deliveryCity = deliveryCity; }
        
        public String getDeliveryPostalCode() { return deliveryPostalCode; }
        public void setDeliveryPostalCode(String deliveryPostalCode) { this.deliveryPostalCode = deliveryPostalCode; }
        
        public String getContactPhone() { return contactPhone; }
        public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
        
        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }
    }

    public static class PaymentIntentRequest {
        private String orderId;
        private String paymentMethod;

        // Getters and setters
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }

    public static class ConfirmPaymentRequest {
        private String paymentIntentId;
        private String orderId;

        // Getters and setters
        public String getPaymentIntentId() { return paymentIntentId; }
        public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
        
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
    }
}
