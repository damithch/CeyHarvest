# Phase 5: Real Stripe Integration - Replace Mock Implementation

## 🎯 Overview
Replace the mock Stripe implementation with real Stripe SDK integration for production-ready payment processing.

## 📋 Implementation Plan

### 1. **Backend Stripe Integration**

#### **A. Add Stripe Dependencies**
```xml
<!-- pom.xml - Add to dependencies -->
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>24.16.0</version>
</dependency>
```

#### **B. Stripe Configuration**
```java
// config/StripeConfig.java
package com.ceyharvest.ceyharvest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import com.stripe.Stripe;

import javax.annotation.PostConstruct;

@Configuration
public class StripeConfig {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }
}
```

#### **C. Enhanced Payment Service**
```java
// service/PaymentService.java - Updated with real Stripe integration
package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.Payment;
import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.repository.PaymentRepository;
import com.ceyharvest.ceyharvest.repository.OrderRepository;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    /**
     * Create real Stripe Payment Intent
     */
    public Map<String, Object> createStripePaymentIntent(String orderId, String buyerEmail, String paymentMethod) {
        try {
            // Get order to determine amount
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                throw new RuntimeException("Order not found");
            }
            
            Order order = orderOpt.get();
            long amountInCents = (long)(order.getTotalAmount() * 100); // Convert to cents

            // Create Payment Intent with Stripe
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("lkr")
                .addPaymentMethodType("card")
                .putMetadata("orderId", orderId)
                .putMetadata("buyerEmail", buyerEmail)
                .setDescription("CeyHarvest Order #" + orderId)
                .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Create local payment record
            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setBuyerEmail(buyerEmail);
            payment.setAmount(order.getTotalAmount());
            payment.setCurrency("LKR");
            payment.setPaymentMethod(paymentMethod);
            payment.setPaymentGateway("STRIPE");
            payment.setTransactionId(paymentIntent.getId());
            payment.setStatus("PENDING");
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Return payment intent details
            Map<String, Object> response = new HashMap<>();
            response.put("id", paymentIntent.getId());
            response.put("client_secret", paymentIntent.getClientSecret());
            response.put("amount", paymentIntent.getAmount());
            response.put("currency", paymentIntent.getCurrency());
            response.put("status", paymentIntent.getStatus());

            return response;

        } catch (StripeException e) {
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    /**
     * Process payment confirmation from Stripe webhook
     */
    public Payment processStripeWebhook(String paymentIntentId, String status) {
        try {
            // Find local payment record
            Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(paymentIntentId);
            if (paymentOpt.isEmpty()) {
                throw new RuntimeException("Payment not found for transaction: " + paymentIntentId);
            }

            Payment payment = paymentOpt.get();
            
            // Update payment status based on Stripe webhook
            switch (status) {
                case "succeeded":
                    payment.setStatus("PAID");
                    break;
                case "payment_failed":
                    payment.setStatus("FAILED");
                    break;
                case "canceled":
                    payment.setStatus("CANCELLED");
                    break;
                default:
                    payment.setStatus("PENDING");
            }

            payment.setUpdatedAt(LocalDateTime.now());
            payment.setGatewayResponse("Stripe webhook: " + status);

            return paymentRepository.save(payment);

        } catch (Exception e) {
            throw new RuntimeException("Failed to process webhook: " + e.getMessage());
        }
    }

    /**
     * Process refund through Stripe
     */
    public Payment processRefund(String paymentId, double refundAmount, String reason) {
        try {
            Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
            if (paymentOpt.isEmpty()) {
                throw new RuntimeException("Payment not found");
            }

            Payment payment = paymentOpt.get();
            
            // Create refund with Stripe
            Map<String, Object> refundParams = new HashMap<>();
            refundParams.put("payment_intent", payment.getTransactionId());
            refundParams.put("amount", (long)(refundAmount * 100)); // Convert to cents
            refundParams.put("reason", reason);

            com.stripe.model.Refund refund = com.stripe.model.Refund.create(refundParams);

            // Update payment status
            payment.setStatus("REFUNDED");
            payment.setUpdatedAt(LocalDateTime.now());
            payment.setGatewayResponse("Refund ID: " + refund.getId());

            return paymentRepository.save(payment);

        } catch (StripeException e) {
            throw new RuntimeException("Failed to process refund: " + e.getMessage());
        }
    }

    /**
     * Retrieve payment from Stripe
     */
    public Map<String, Object> getStripePaymentIntent(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", paymentIntent.getId());
            response.put("status", paymentIntent.getStatus());
            response.put("amount", paymentIntent.getAmount());
            response.put("currency", paymentIntent.getCurrency());
            response.put("created", paymentIntent.getCreated());
            
            return response;

        } catch (StripeException e) {
            throw new RuntimeException("Failed to retrieve payment intent: " + e.getMessage());
        }
    }
}
```

#### **D. Stripe Webhook Controller**
```java
// controller/WebhookController.java
package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.service.PaymentService;
import com.ceyharvest.ceyharvest.service.OrderService;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.exception.SignatureVerificationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhook")
public class WebhookController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            switch (event.getType()) {
                case "payment_intent.succeeded":
                    handlePaymentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentFailed(event);
                    break;
                case "payment_intent.canceled":
                    handlePaymentCanceled(event);
                    break;
                default:
                    System.out.println("Unhandled event type: " + event.getType());
            }

            return ResponseEntity.ok("Webhook handled");

        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook error");
        }
    }

    private void handlePaymentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            String orderId = paymentIntent.getMetadata().get("orderId");
            
            // Update payment status
            paymentService.processStripeWebhook(paymentIntent.getId(), "succeeded");
            
            // Update order status
            orderService.updatePaymentStatus(orderId, "PAID", paymentIntent.getId());
        }
    }

    private void handlePaymentFailed(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            String orderId = paymentIntent.getMetadata().get("orderId");
            
            // Update payment status
            paymentService.processStripeWebhook(paymentIntent.getId(), "payment_failed");
            
            // Update order status
            orderService.updatePaymentStatus(orderId, "FAILED", paymentIntent.getId());
        }
    }

    private void handlePaymentCanceled(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            String orderId = paymentIntent.getMetadata().get("orderId");
            
            // Update payment status
            paymentService.processStripeWebhook(paymentIntent.getId(), "canceled");
            
            // Update order status
            orderService.updatePaymentStatus(orderId, "CANCELLED", paymentIntent.getId());
        }
    }
}
```

### 2. **Environment Configuration**
```properties
# application.properties - Add Stripe configuration
# Stripe Configuration
stripe.secret.key=${STRIPE_SECRET_KEY:sk_test_your_secret_key}
stripe.publishable.key=${STRIPE_PUBLISHABLE_KEY:pk_test_your_publishable_key}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET:whsec_your_webhook_secret}

# Webhook endpoint
stripe.webhook.endpoint=/webhook/stripe
```

### 3. **Security Configuration Updates**
```java
// config/security/SecurityConfig.java - Add webhook endpoint
.requestMatchers("/webhook/stripe").permitAll() // Allow Stripe webhooks
```

### 4. **Enhanced Payment Repository**
```java
// repository/PaymentRepository.java - Add method for transaction ID lookup
package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByOrderId(String orderId);
    List<Payment> findByBuyerEmail(String buyerEmail);
    Optional<Payment> findByTransactionId(String transactionId); // New method for Stripe integration
    List<Payment> findByStatus(String status);
}
```

### 5. **Testing Integration**
```java
// test/StripeIntegrationTest.java
@SpringBootTest
@TestPropertySource(properties = {
    "stripe.secret.key=sk_test_test_key",
    "stripe.webhook.secret=whsec_test_secret"
})
class StripeIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Test
    void testCreatePaymentIntent() {
        // Test real Stripe integration
        // Note: Use test API keys for unit tests
    }

    @Test
    void testWebhookProcessing() {
        // Test webhook handling
    }
}
```

## 🔧 Deployment Configuration

### **Production Environment Variables**
```bash
# Production .env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

### **Stripe Dashboard Setup**
1. **Create Stripe Account**
2. **Configure Webhooks:**
   - Endpoint: `https://your-domain.com/webhook/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
3. **Set Up API Keys**
4. **Configure Currency and Payment Methods**

## ✅ Implementation Checklist
- [ ] Add Stripe Java SDK dependency
- [ ] Configure Stripe API keys
- [ ] Update PaymentService with real Stripe integration
- [ ] Implement webhook controller
- [ ] Add webhook endpoint to security config
- [ ] Update PaymentRepository with transaction ID lookup
- [ ] Set up Stripe dashboard and webhooks
- [ ] Test with Stripe test cards
- [ ] Configure production environment
- [ ] Implement error handling for Stripe exceptions
- [ ] Add logging for payment events
- [ ] Set up monitoring for payment failures

## 🧪 Testing with Stripe Test Cards
```
Test Card Numbers:
- Success: 4242424242424242
- Declined: 4000000000000002
- Insufficient Funds: 4000000000009995
- 3D Secure: 4000000000003220
```
