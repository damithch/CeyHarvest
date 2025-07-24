package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    private String id;
    
    /**
     * Email of the customer who placed the order
     */
    private String customerEmail;
    
    /**
     * Total order amount
     */
    private double totalAmount;
    
    /**
     * Order status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
     */
    private String status = "PENDING";
    
    /**
     * Payment status (PENDING, PAID, FAILED, REFUNDED)
     */
    private String paymentStatus = "PENDING";
    
    /**
     * Payment ID reference
     */
    private String paymentId;
    
    /**
     * Delivery address for the order
     */
    private String deliveryAddress;
    
    /**
     * Delivery city
     */
    private String deliveryCity;
    
    /**
     * Delivery postal code
     */
    private String deliveryPostalCode;
    
    /**
     * Contact phone number for delivery
     */
    private String contactPhone;
    
    /**
     * Order creation timestamp
     */
    private LocalDateTime createdAt;
    
    /**
     * Order last updated timestamp
     */
    private LocalDateTime updatedAt;
    
    /**
     * Expected delivery date
     */
    private LocalDateTime expectedDeliveryDate;
    
    /**
     * Special instructions for the order
     */
    private String instructions;
    
    // Legacy fields - keeping for backward compatibility
    private String farmerId; // Will be removed when we fully migrate
    private String productId; // Will be removed when we fully migrate  
    private int quantity; // Will be removed when we fully migrate
    private double totalPrice; // Will be removed when we fully migrate
    private String orderDate; // Will be removed when we fully migrate

    // Manual getters and setters to ensure compatibility
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    
    public String getDeliveryCity() { return deliveryCity; }
    public void setDeliveryCity(String deliveryCity) { this.deliveryCity = deliveryCity; }
    
    public String getDeliveryPostalCode() { return deliveryPostalCode; }
    public void setDeliveryPostalCode(String deliveryPostalCode) { this.deliveryPostalCode = deliveryPostalCode; }
    
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDateTime expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
    
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    
    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }
    
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    
    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
    
    public String getOrderDate() { return orderDate; }
    public void setOrderDate(String orderDate) { this.orderDate = orderDate; }
}