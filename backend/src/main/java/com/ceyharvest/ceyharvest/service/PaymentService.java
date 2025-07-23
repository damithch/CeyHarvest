package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.Payment;
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

@Service
@Slf4j
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Value("${stripe.secret.key:sk_test_default}")
    private String stripeSecretKey;

    @Value("${stripe.publishable.key:pk_test_default}")
    private String stripePublishableKey;

    public PaymentService() {
        // Initialize Stripe with secret key
        // In a real application, this should be set in application.properties
        Stripe.apiKey = System.getenv("STRIPE_SECRET_KEY");
        if (Stripe.apiKey == null) {
            Stripe.apiKey = "sk_test_51234567890"; // Default test key for development
        }
    }

    public String getStripePublishableKey() {
        return stripePublishableKey;
    }

    public Map<String, Object> createPaymentIntent(BigDecimal amount, String currency, String buyerId) {
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

            log.info("Payment intent created successfully: {}", paymentIntent.getId());
            return response;

        } catch (StripeException e) {
            log.error("Error creating payment intent", e);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    public PaymentIntent retrievePaymentIntent(String paymentIntentId) {
        try {
            return PaymentIntent.retrieve(paymentIntentId);
        } catch (StripeException e) {
            log.error("Error retrieving payment intent: {}", paymentIntentId, e);
            throw new RuntimeException("Failed to retrieve payment intent: " + e.getMessage());
        }
    }

    public boolean isPaymentSuccessful(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            return "succeeded".equals(paymentIntent.getStatus());
        } catch (StripeException e) {
            log.error("Error checking payment status: {}", paymentIntentId, e);
            return false;
        }
    }

    public Payment processPayment(String paymentIntentId, String orderId, String buyerEmail) {
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
            // This method should create a payment intent for a specific order
            // For now, let's create a basic implementation
            
            // In a real implementation, you would fetch the order details and amount
            // For demo purposes, using a default amount
            BigDecimal amount = BigDecimal.valueOf(100.00); // Default amount in LKR
            String currency = "lkr";
            
            return createPaymentIntent(amount, currency, buyerEmail);
            
        } catch (Exception e) {
            log.error("Error creating Stripe payment intent for order: {}", orderId, e);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }
}