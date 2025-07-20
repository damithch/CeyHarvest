package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Payment entity for tracking payment transactions
 */
@Document(collection = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    private String id;
    
    /**
     * Reference to the order this payment is for
     */
    private String orderId;
    
    /**
     * Email of the buyer making the payment
     */
    private String buyerEmail;
    
    /**
     * Total payment amount
     */
    private double amount;
    
    /**
     * Currency code (LKR, USD, etc.)
     */
    private String currency = "LKR";
    
    /**
     * Payment method (CARD, BANK_TRANSFER, DIGITAL_WALLET)
     */
    private String paymentMethod;
    
    /**
     * Payment gateway used (STRIPE, PAYPAL, LOCAL_BANK)
     */
    private String paymentGateway;
    
    /**
     * Payment status (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)
     */
    private String status = "PENDING";
    
    /**
     * Transaction ID from payment gateway
     */
    private String transactionId;
    
    /**
     * Payment gateway response data (JSON)
     */
    private String gatewayResponse;
    
    /**
     * Failure reason if payment failed
     */
    private String failureReason;
    
    /**
     * Payment created timestamp
     */
    private LocalDateTime createdAt;
    
    /**
     * Payment processed timestamp
     */
    private LocalDateTime processedAt;
    
    /**
     * Payment last updated timestamp
     */
    private LocalDateTime updatedAt;
    
    /**
     * Additional metadata for payment processing
     */
    private String metadata;
}
