package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Payment entity operations
 */
public interface PaymentRepository extends MongoRepository<Payment, String> {
    
    /**
     * Find payment by order ID
     * @param orderId ID of the order
     * @return Optional Payment if found
     */
    Optional<Payment> findByOrderId(String orderId);
    
    /**
     * Find payments by buyer email
     * @param buyerEmail Email of the buyer
     * @return List of payments
     */
    List<Payment> findByBuyerEmail(String buyerEmail);
    
    /**
     * Find payments by status
     * @param status Payment status
     * @return List of payments
     */
    List<Payment> findByStatus(String status);
    
    /**
     * Find payment by transaction ID
     * @param transactionId Transaction ID from payment gateway
     * @return Optional Payment if found
     */
    Optional<Payment> findByTransactionId(String transactionId);
    
    /**
     * Find payments by payment gateway
     * @param paymentGateway Payment gateway name
     * @return List of payments
     */
    List<Payment> findByPaymentGateway(String paymentGateway);
}
