package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.Payment;
import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import jakarta.annotation.PostConstruct;

@Service
@Slf4j
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderService orderService;

    @Value("${stripe.secret.key:sk_test_default}")
    private String stripeSecretKey;
    

    @Value("${stripe.publishable.key:pk_test_default}")
    private String stripePublishableKey;

    private boolean stripeConfigured = false;

    @PostConstruct
    public void initializeStripe() {
        // Check if proper Stripe keys are configured
        if (stripeSecretKey != null && 
            !stripeSecretKey.equals("sk_test_default") && 
            !stripeSecretKey.contains("PASTE_YOUR_ACTUAL")) {
            
            Stripe.apiKey = stripeSecretKey;
            stripeConfigured = true;
            log.info("Stripe initialized with configured secret key");
        } else {
            // Check environment variable as fallback
            String envKey = System.getenv("STRIPE_SECRET_KEY");
            if (envKey != null && !envKey.isEmpty()) {
                Stripe.apiKey = envKey;
                stripeConfigured = true;
                log.info("Stripe initialized with environment variable");
            } else {
                log.warn("Stripe not properly configured - using mock mode");
                stripeConfigured = false;
            }
        }
    }

    public String getStripePublishableKey() {
        if (!stripeConfigured) {
            // Return a mock publishable key for development
            return "pk_test_mock_key_for_development";
        }
        return stripePublishableKey;
    }

    public Map<String, Object> createPaymentIntent(BigDecimal amount, String currency, String buyerId) {
        // If Stripe is not configured, return mock payment intent
        if (!stripeConfigured) {
            log.warn("Stripe not configured, returning mock payment intent");
            Map<String, Object> mockResponse = new HashMap<>();
            mockResponse.put("clientSecret", "pi_mock_" + System.currentTimeMillis() + "_secret_mock");
            mockResponse.put("paymentIntentId", "pi_mock_" + System.currentTimeMillis());
            mockResponse.put("amount", amount);
            mockResponse.put("currency", currency);
            mockResponse.put("status", "requires_payment_method");
            mockResponse.put("mock", true);
            log.info("Mock payment intent created for amount: {} {}", amount, currency);
            return mockResponse;
        }
        
        try {
            // Convert amount to cents (Stripe expects amounts in cents)
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency)
                    .addPaymentMethodType("card")
                    .putMetadata("buyer_id", buyerId)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            Map<String, Object> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("paymentIntentId", paymentIntent.getId());
            response.put("amount", amount);
            response.put("currency", currency);
            response.put("mock", false);

            log.info("Payment intent created successfully: {}", paymentIntent.getId());
            return response;

        } catch (StripeException e) {
            log.error("Error creating payment intent", e);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    public PaymentIntent retrievePaymentIntent(String paymentIntentId) {
        if (!stripeConfigured) {
            log.warn("Stripe not configured, cannot retrieve payment intent: {}", paymentIntentId);
            return null;
        }
        
        try {
            return PaymentIntent.retrieve(paymentIntentId);
        } catch (StripeException e) {
            log.error("Error retrieving payment intent: {}", paymentIntentId, e);
            throw new RuntimeException("Failed to retrieve payment intent: " + e.getMessage());
        }
    }

    public boolean isPaymentSuccessful(String paymentIntentId) {
        if (!stripeConfigured) {
            // For mock mode, consider mock payment intents as successful
            return paymentIntentId != null && paymentIntentId.startsWith("pi_mock_");
        }
        
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            return "succeeded".equals(paymentIntent.getStatus());
        } catch (StripeException e) {
            log.error("Error checking payment status: {}", paymentIntentId, e);
            return false;
        }
    }

    public Payment processPayment(String paymentIntentId, String orderId, String buyerEmail) {
        if (!stripeConfigured) {
            // Handle mock payment
            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setBuyerEmail(buyerEmail);
            payment.setAmount(50.0); // Mock amount
            payment.setCurrency("USD");
            payment.setPaymentMethod("CARD");
            payment.setPaymentGateway("STRIPE_MOCK");
            payment.setTransactionId(paymentIntentId);
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            payment.setStatus("COMPLETED");
            payment.setProcessedAt(LocalDateTime.now());
            payment.setGatewayResponse("{\"mock\": true, \"status\": \"succeeded\"}");
            
            payment = paymentRepository.save(payment);
            log.info("Mock payment processed successfully: {} for order: {}", payment.getId(), orderId);
            return payment;
        }
        
        try {
            // Retrieve payment intent from Stripe
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            
            // Create payment record
            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setBuyerEmail(buyerEmail);
            payment.setAmount(paymentIntent.getAmount() / 100.0); // Convert from cents
            payment.setCurrency(paymentIntent.getCurrency().toUpperCase());
            payment.setPaymentMethod("CARD");
            payment.setPaymentGateway("STRIPE");
            payment.setTransactionId(paymentIntentId);
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            
            // Update status based on Stripe payment intent status
            switch (paymentIntent.getStatus()) {
                case "succeeded":
                    payment.setStatus("COMPLETED");
                    payment.setProcessedAt(LocalDateTime.now());
                    break;
                case "processing":
                    payment.setStatus("PROCESSING");
                    break;
                case "requires_payment_method":
                case "requires_confirmation":
                case "requires_action":
                    payment.setStatus("PENDING");
                    break;
                default:
                    payment.setStatus("FAILED");
                    payment.setFailureReason("Payment intent status: " + paymentIntent.getStatus());
                    break;
            }
            
            // Store payment gateway response
            payment.setGatewayResponse(paymentIntent.toJson());
            
            // Save payment record
            payment = paymentRepository.save(payment);
            
            log.info("Payment processed successfully: {} for order: {}", payment.getId(), orderId);
            return payment;
            
        } catch (StripeException e) {
            log.error("Error processing payment for order: {}", orderId, e);
            
            // Create failed payment record
            Payment failedPayment = new Payment();
            failedPayment.setOrderId(orderId);
            failedPayment.setBuyerEmail(buyerEmail);
            failedPayment.setPaymentGateway("STRIPE");
            failedPayment.setTransactionId(paymentIntentId);
            failedPayment.setStatus("FAILED");
            failedPayment.setFailureReason("Stripe error: " + e.getMessage());
            failedPayment.setCreatedAt(LocalDateTime.now());
            failedPayment.setUpdatedAt(LocalDateTime.now());
            
            return paymentRepository.save(failedPayment);
        }
    }

    public Map<String, Object> createStripePaymentIntent(String orderId, String buyerEmail, String paymentMethod) {
        try {
            System.out.println("=== PAYMENT SERVICE DEBUG ===");
            System.out.println("Creating payment intent for order: " + orderId);
            System.out.println("Buyer email: " + buyerEmail);
            System.out.println("Payment method: " + paymentMethod);
            
            // Fetch the order to get the actual amount
            Order order = orderService.getOrderWithItems(orderId);
            if (order == null) {
                throw new RuntimeException("Order not found: " + orderId);
            }
            
            System.out.println("Order found - Total amount: " + order.getTotalAmount());
            System.out.println("Order customer email: " + order.getCustomerEmail());
            
            // Validate that the buyer owns this order
            if (!buyerEmail.equals(order.getCustomerEmail())) {
                throw new RuntimeException("Unauthorized access to order: " + orderId);
            }
            
            // Get the order amount
            BigDecimal amount = BigDecimal.valueOf(order.getTotalAmount());
            String currency = "usd"; // Use USD for Stripe compatibility, convert LKR to USD
            
            // For demo purposes, convert LKR to USD (1 USD = ~320 LKR)
            // Since we're dealing with LKR amounts, convert to USD
            amount = amount.divide(BigDecimal.valueOf(320), 2, java.math.RoundingMode.HALF_UP);
            
            // Ensure minimum amount for Stripe (0.50 USD)
            if (amount.compareTo(BigDecimal.valueOf(0.50)) < 0) {
                amount = BigDecimal.valueOf(0.50);
                System.out.println("Amount adjusted to minimum: " + amount);
            }
            
            System.out.println("Final amount in USD: " + amount);
            
            log.info("Creating payment intent for order: {} with amount: {} {}", orderId, amount, currency);
            
            return createPaymentIntent(amount, currency, buyerEmail);
            
        } catch (Exception e) {
            System.out.println("ERROR in createStripePaymentIntent: " + e.getMessage());
            e.printStackTrace();
            log.error("Error creating Stripe payment intent for order: {}", orderId, e);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }
}