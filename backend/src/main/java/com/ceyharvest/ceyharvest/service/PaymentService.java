package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.Payment;
import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.repository.PaymentRepository;
import com.ceyharvest.ceyharvest.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service class for payment processing
 * Integrates with Stripe payment gateway
 */
@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Value("${ceyharvest.payment.stripe.secret-key:sk_test_placeholder}")
    private String stripeSecretKey;

    @Value("${ceyharvest.payment.stripe.publishable-key:pk_test_placeholder}")
    private String stripePublishableKey;

    /**
     * Create a new payment record
     */
    public Payment createPayment(String orderId, String buyerEmail, double amount, String paymentMethod) {
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setBuyerEmail(buyerEmail);
        payment.setAmount(amount);
        payment.setCurrency("LKR");
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentGateway("STRIPE");
        payment.setStatus("PENDING");
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }

    /**
     * Create Stripe Payment Intent
     * This is a mock implementation - replace with actual Stripe integration
     */
    public Map<String, Object> createStripePaymentIntent(String orderId, String buyerEmail, String paymentMethod) {
        try {
            // Get order to determine amount
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                throw new RuntimeException("Order not found");
            }
            
            Order order = orderOpt.get();
            double amount = order.getTotalAmount();
            
            // Mock Stripe Payment Intent creation
            // In production, this would use Stripe's Java SDK
            Map<String, Object> paymentIntent = new HashMap<>();
            paymentIntent.put("id", "pi_mock_" + System.currentTimeMillis());
            paymentIntent.put("client_secret", "pi_mock_" + System.currentTimeMillis() + "_secret");
            paymentIntent.put("amount", (long)(amount * 100)); // Stripe uses cents
            paymentIntent.put("currency", "lkr");
            paymentIntent.put("status", "requires_payment_method");
            paymentIntent.put("metadata", Map.of("orderId", orderId, "buyerEmail", buyerEmail));
            
            return paymentIntent;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    /**
     * Process payment confirmation
     */
    public Payment processPayment(String paymentIntentId, String orderId, String buyerEmail) {
        try {
            // Get order
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                throw new RuntimeException("Order not found");
            }
            
            Order order = orderOpt.get();
            
            // Create payment record
            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setBuyerEmail(buyerEmail);
            payment.setAmount(order.getTotalAmount());
            payment.setCurrency("LKR");
            payment.setPaymentMethod("CARD");
            payment.setPaymentGateway("STRIPE");
            payment.setTransactionId(paymentIntentId);
            payment.setStatus("PAID"); // Mock successful payment
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            
            // Mock gateway response
            payment.setGatewayResponse("Payment processed successfully: " + paymentIntentId);
            
            return paymentRepository.save(payment);
            
        } catch (Exception e) {
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }

    /**
     * Process mock payment (for development)
     * In production, this would be replaced with actual Stripe webhook handling
     */
    public Payment processPaymentOld(String paymentId, String transactionId, boolean success) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }
        
        Payment payment = paymentOpt.get();
        payment.setTransactionId(transactionId);
        payment.setProcessedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        if (success) {
            payment.setStatus("COMPLETED");
            payment.setGatewayResponse("{\"status\":\"succeeded\",\"paid\":true}");
        } else {
            payment.setStatus("FAILED");
            payment.setFailureReason("Payment declined by bank");
            payment.setGatewayResponse("{\"status\":\"failed\",\"failure_reason\":\"generic_decline\"}");
        }
        
        return paymentRepository.save(payment);
    }

    /**
     * Get payment by order ID
     */
    public Optional<Payment> getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    /**
     * Get payment by ID
     */
    public Optional<Payment> getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId);
    }

    /**
     * Update payment status
     */
    public Payment updatePaymentStatus(String paymentId, String status, String transactionId) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }
        
        Payment payment = paymentOpt.get();
        payment.setStatus(status);
        if (transactionId != null) {
            payment.setTransactionId(transactionId);
        }
        payment.setUpdatedAt(LocalDateTime.now());
        
        if ("COMPLETED".equals(status)) {
            payment.setProcessedAt(LocalDateTime.now());
        }
        
        return paymentRepository.save(payment);
    }

    /**
     * Refund payment (mock implementation)
     */
    public Payment refundPayment(String paymentId, double refundAmount) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }
        
        Payment payment = paymentOpt.get();
        if (!"COMPLETED".equals(payment.getStatus())) {
            throw new RuntimeException("Cannot refund payment that is not completed");
        }
        
        // In production, this would call Stripe's refund API
        payment.setStatus("REFUNDED");
        payment.setUpdatedAt(LocalDateTime.now());
        payment.setGatewayResponse("{\"status\":\"refunded\",\"amount_refunded\":" + (refundAmount * 100) + "}");
        
        return paymentRepository.save(payment);
    }
}
