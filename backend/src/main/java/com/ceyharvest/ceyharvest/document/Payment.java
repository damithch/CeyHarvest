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

    // Manual getters and setters to ensure compatibility
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    
    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }
    
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getPaymentGateway() { return paymentGateway; }
    public void setPaymentGateway(String paymentGateway) { this.paymentGateway = paymentGateway; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    
    public String getGatewayResponse() { return gatewayResponse; }
    public void setGatewayResponse(String gatewayResponse) { this.gatewayResponse = gatewayResponse; }
    
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
}
