# Phase 7: Advanced Features - Refunds and Notifications

## 🎯 Overview
Implement advanced payment features including refund processing, comprehensive notification system, and enhanced user experience features.

## 📋 Implementation Plan

### 1. **Refund Management System**

#### **A. Refund Entity**
```java
// document/Refund.java
package com.ceyharvest.ceyharvest.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "refunds")
public class Refund {
    @Id
    private String id;
    private String paymentId;
    private String orderId;
    private String buyerEmail;
    private String farmerEmail;
    private double refundAmount;
    private double originalAmount;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED, PROCESSED, FAILED
    private String refundType; // FULL, PARTIAL
    private String gatewayRefundId;
    private String gatewayResponse;
    private String requestedBy; // BUYER, FARMER, ADMIN
    private String processedBy;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors, getters, and setters
    public Refund() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }

    public String getFarmerEmail() { return farmerEmail; }
    public void setFarmerEmail(String farmerEmail) { this.farmerEmail = farmerEmail; }

    public double getRefundAmount() { return refundAmount; }
    public void setRefundAmount(double refundAmount) { this.refundAmount = refundAmount; }

    public double getOriginalAmount() { return originalAmount; }
    public void setOriginalAmount(double originalAmount) { this.originalAmount = originalAmount; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRefundType() { return refundType; }
    public void setRefundType(String refundType) { this.refundType = refundType; }

    public String getGatewayRefundId() { return gatewayRefundId; }
    public void setGatewayRefundId(String gatewayRefundId) { this.gatewayRefundId = gatewayRefundId; }

    public String getGatewayResponse() { return gatewayResponse; }
    public void setGatewayResponse(String gatewayResponse) { this.gatewayResponse = gatewayResponse; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
```

#### **B. Refund Repository**
```java
// repository/RefundRepository.java
package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Refund;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRepository extends MongoRepository<Refund, String> {
    List<Refund> findByOrderId(String orderId);
    List<Refund> findByPaymentId(String paymentId);
    List<Refund> findByBuyerEmail(String buyerEmail);
    List<Refund> findByStatus(String status);
    List<Refund> findByRequestedBy(String requestedBy);
}
```

#### **C. Refund Service**
```java
// service/RefundService.java
package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.Refund;
import com.ceyharvest.ceyharvest.document.Payment;
import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.repository.RefundRepository;
import com.ceyharvest.ceyharvest.repository.PaymentRepository;
import com.ceyharvest.ceyharvest.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RefundService {

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Request a refund
     */
    public Refund requestRefund(String orderId, String paymentId, double refundAmount, 
                               String reason, String requestedBy, String userEmail) {
        
        // Validate payment exists
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }

        Payment payment = paymentOpt.get();
        
        // Validate order exists
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found");
        }

        Order order = orderOpt.get();

        // Validate refund amount
        if (refundAmount > payment.getAmount()) {
            throw new RuntimeException("Refund amount cannot exceed payment amount");
        }

        // Check if payment is eligible for refund
        if (!"PAID".equals(payment.getStatus())) {
            throw new RuntimeException("Payment is not eligible for refund");
        }

        // Create refund request
        Refund refund = new Refund();
        refund.setPaymentId(paymentId);
        refund.setOrderId(orderId);
        refund.setBuyerEmail(order.getCustomerEmail());
        refund.setRefundAmount(refundAmount);
        refund.setOriginalAmount(payment.getAmount());
        refund.setReason(reason);
        refund.setStatus("PENDING");
        refund.setRefundType(refundAmount == payment.getAmount() ? "FULL" : "PARTIAL");
        refund.setRequestedBy(requestedBy);
        refund.setRequestedAt(LocalDateTime.now());
        refund.setCreatedAt(LocalDateTime.now());
        refund.setUpdatedAt(LocalDateTime.now());

        Refund savedRefund = refundRepository.save(refund);

        // Send notification to admin
        notificationService.sendRefundRequestNotification(savedRefund);

        return savedRefund;
    }

    /**
     * Process refund (admin approval)
     */
    public Refund processRefund(String refundId, String action, String processedBy) {
        Optional<Refund> refundOpt = refundRepository.findById(refundId);
        if (refundOpt.isEmpty()) {
            throw new RuntimeException("Refund not found");
        }

        Refund refund = refundOpt.get();

        if (!"PENDING".equals(refund.getStatus())) {
            throw new RuntimeException("Refund is not in pending status");
        }

        if ("APPROVE".equals(action)) {
            refund.setStatus("APPROVED");
            refund.setProcessedBy(processedBy);
            refund.setProcessedAt(LocalDateTime.now());
            refund.setUpdatedAt(LocalDateTime.now());

            // Process refund with payment gateway
            try {
                Payment updatedPayment = paymentService.processRefund(
                    refund.getPaymentId(), 
                    refund.getRefundAmount(), 
                    refund.getReason()
                );
                
                refund.setStatus("PROCESSED");
                refund.setGatewayRefundId(updatedPayment.getGatewayResponse());
                
                // Send success notification
                notificationService.sendRefundProcessedNotification(refund);
                
            } catch (Exception e) {
                refund.setStatus("FAILED");
                refund.setGatewayResponse("Refund failed: " + e.getMessage());
                
                // Send failure notification
                notificationService.sendRefundFailedNotification(refund);
            }

        } else if ("REJECT".equals(action)) {
            refund.setStatus("REJECTED");
            refund.setProcessedBy(processedBy);
            refund.setProcessedAt(LocalDateTime.now());
            
            // Send rejection notification
            notificationService.sendRefundRejectedNotification(refund);
        }

        refund.setUpdatedAt(LocalDateTime.now());
        return refundRepository.save(refund);
    }

    /**
     * Get refunds by buyer email
     */
    public List<Refund> getRefundsByBuyer(String buyerEmail) {
        return refundRepository.findByBuyerEmail(buyerEmail);
    }

    /**
     * Get pending refunds (for admin)
     */
    public List<Refund> getPendingRefunds() {
        return refundRepository.findByStatus("PENDING");
    }

    /**
     * Get refund by ID
     */
    public Refund getRefundById(String refundId) {
        Optional<Refund> refundOpt = refundRepository.findById(refundId);
        return refundOpt.orElse(null);
    }
}
```

### 2. **Notification System**

#### **A. Notification Entity**
```java
// document/Notification.java
package com.ceyharvest.ceyharvest.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String recipientEmail;
    private String recipientRole; // BUYER, FARMER, ADMIN
    private String type; // EMAIL, SMS, PUSH, IN_APP
    private String category; // ORDER, PAYMENT, REFUND, SECURITY, SYSTEM
    private String title;
    private String message;
    private Map<String, Object> data; // Additional data for template rendering
    private String status; // PENDING, SENT, FAILED, READ
    private String templateId;
    private boolean isRead;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors, getters, and setters
    public Notification() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTemplateId() { return templateId; }
    public void setTemplateId(String templateId) { this.templateId = templateId; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
```

#### **B. Notification Service**
```java
// service/NotificationService.java
package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.Notification;
import com.ceyharvest.ceyharvest.document.Refund;
import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.document.Payment;
import com.ceyharvest.ceyharvest.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailTemplateService emailTemplateService;

    /**
     * Send order confirmation notification
     */
    public void sendOrderConfirmationNotification(Order order) {
        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("totalAmount", order.getTotalAmount());
        data.put("deliveryAddress", order.getDeliveryAddress());

        sendNotification(
            order.getCustomerEmail(),
            "BUYER",
            "EMAIL",
            "ORDER",
            "Order Confirmation - CeyHarvest",
            "Your order has been confirmed and will be processed soon.",
            "order_confirmation",
            data
        );
    }

    /**
     * Send payment success notification
     */
    public void sendPaymentSuccessNotification(Payment payment, Order order) {
        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getId());
        data.put("paymentAmount", payment.getAmount());
        data.put("transactionId", payment.getTransactionId());

        sendNotification(
            payment.getBuyerEmail(),
            "BUYER",
            "EMAIL",
            "PAYMENT",
            "Payment Successful - CeyHarvest",
            "Your payment has been processed successfully.",
            "payment_success",
            data
        );
    }

    /**
     * Send refund request notification
     */
    public void sendRefundRequestNotification(Refund refund) {
        Map<String, Object> data = new HashMap<>();
        data.put("refundId", refund.getId());
        data.put("orderId", refund.getOrderId());
        data.put("refundAmount", refund.getRefundAmount());
        data.put("reason", refund.getReason());

        // Notify admin
        sendNotification(
            "admin@ceyharvest.com",
            "ADMIN",
            "EMAIL",
            "REFUND",
            "New Refund Request - CeyHarvest",
            "A new refund request has been submitted.",
            "refund_request_admin",
            data
        );

        // Notify buyer
        sendNotification(
            refund.getBuyerEmail(),
            "BUYER",
            "EMAIL",
            "REFUND",
            "Refund Request Submitted - CeyHarvest",
            "Your refund request has been submitted and is under review.",
            "refund_request_buyer",
            data
        );
    }

    /**
     * Send refund processed notification
     */
    public void sendRefundProcessedNotification(Refund refund) {
        Map<String, Object> data = new HashMap<>();
        data.put("refundId", refund.getId());
        data.put("refundAmount", refund.getRefundAmount());
        data.put("gatewayRefundId", refund.getGatewayRefundId());

        sendNotification(
            refund.getBuyerEmail(),
            "BUYER",
            "EMAIL",
            "REFUND",
            "Refund Processed - CeyHarvest",
            "Your refund has been processed successfully.",
            "refund_processed",
            data
        );
    }

    /**
     * Send refund rejected notification
     */
    public void sendRefundRejectedNotification(Refund refund) {
        Map<String, Object> data = new HashMap<>();
        data.put("refundId", refund.getId());
        data.put("reason", refund.getReason());

        sendNotification(
            refund.getBuyerEmail(),
            "BUYER",
            "EMAIL",
            "REFUND",
            "Refund Request Rejected - CeyHarvest",
            "Your refund request has been reviewed and rejected.",
            "refund_rejected",
            data
        );
    }

    /**
     * Send refund failed notification
     */
    public void sendRefundFailedNotification(Refund refund) {
        Map<String, Object> data = new HashMap<>();
        data.put("refundId", refund.getId());
        data.put("gatewayResponse", refund.getGatewayResponse());

        sendNotification(
            refund.getBuyerEmail(),
            "BUYER",
            "EMAIL",
            "REFUND",
            "Refund Processing Failed - CeyHarvest",
            "There was an issue processing your refund. Our team will contact you soon.",
            "refund_failed",
            data
        );
    }

    /**
     * Generic notification sender
     */
    private void sendNotification(String recipientEmail, String recipientRole, String type, 
                                String category, String title, String message, 
                                String templateId, Map<String, Object> data) {
        
        // Create notification record
        Notification notification = new Notification();
        notification.setRecipientEmail(recipientEmail);
        notification.setRecipientRole(recipientRole);
        notification.setType(type);
        notification.setCategory(category);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTemplateId(templateId);
        notification.setData(data);
        notification.setStatus("PENDING");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());

        Notification savedNotification = notificationRepository.save(notification);

        // Send actual notification
        if ("EMAIL".equals(type)) {
            sendEmailNotification(savedNotification);
        }
        // Add other notification types (SMS, PUSH) here
    }

    /**
     * Send email notification
     */
    private void sendEmailNotification(Notification notification) {
        try {
            String emailContent = emailTemplateService.generateEmailContent(
                notification.getTemplateId(), 
                notification.getData()
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(notification.getRecipientEmail());
            message.setSubject(notification.getTitle());
            message.setText(emailContent);
            message.setFrom("noreply@ceyharvest.com");

            mailSender.send(message);

            // Update notification status
            notification.setStatus("SENT");
            notification.setSentAt(LocalDateTime.now());
            notification.setUpdatedAt(LocalDateTime.now());
            notificationRepository.save(notification);

        } catch (Exception e) {
            // Update notification status to failed
            notification.setStatus("FAILED");
            notification.setUpdatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    /**
     * Get notifications for user
     */
    public List<Notification> getNotificationsForUser(String userEmail) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(userEmail);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null && !notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification.setUpdatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    /**
     * Get unread notification count
     */
    public long getUnreadCount(String userEmail) {
        return notificationRepository.countByRecipientEmailAndIsRead(userEmail, false);
    }
}
```

### 3. **Email Template Service**
```java
// service/EmailTemplateService.java
package com.ceyharvest.ceyharvest.service;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class EmailTemplateService {

    public String generateEmailContent(String templateId, Map<String, Object> data) {
        switch (templateId) {
            case "order_confirmation":
                return generateOrderConfirmationEmail(data);
            case "payment_success":
                return generatePaymentSuccessEmail(data);
            case "refund_request_buyer":
                return generateRefundRequestBuyerEmail(data);
            case "refund_processed":
                return generateRefundProcessedEmail(data);
            case "refund_rejected":
                return generateRefundRejectedEmail(data);
            default:
                return "Default email template";
        }
    }

    private String generateOrderConfirmationEmail(Map<String, Object> data) {
        return String.format(
            "Dear Customer,\n\n" +
            "Thank you for your order with CeyHarvest!\n\n" +
            "Order Details:\n" +
            "Order ID: %s\n" +
            "Total Amount: LKR %.2f\n" +
            "Delivery Address: %s\n\n" +
            "Your order will be processed and delivered within 3-5 business days.\n\n" +
            "Thank you for choosing CeyHarvest!\n\n" +
            "Best regards,\n" +
            "CeyHarvest Team",
            data.get("orderId"),
            data.get("totalAmount"),
            data.get("deliveryAddress")
        );
    }

    private String generatePaymentSuccessEmail(Map<String, Object> data) {
        return String.format(
            "Dear Customer,\n\n" +
            "Your payment has been processed successfully!\n\n" +
            "Payment Details:\n" +
            "Order ID: %s\n" +
            "Amount Paid: LKR %.2f\n" +
            "Transaction ID: %s\n\n" +
            "Your order is now confirmed and will be processed soon.\n\n" +
            "Thank you for choosing CeyHarvest!\n\n" +
            "Best regards,\n" +
            "CeyHarvest Team",
            data.get("orderId"),
            data.get("paymentAmount"),
            data.get("transactionId")
        );
    }

    private String generateRefundRequestBuyerEmail(Map<String, Object> data) {
        return String.format(
            "Dear Customer,\n\n" +
            "We have received your refund request.\n\n" +
            "Refund Details:\n" +
            "Refund ID: %s\n" +
            "Order ID: %s\n" +
            "Refund Amount: LKR %.2f\n" +
            "Reason: %s\n\n" +
            "Our team will review your request and process it within 3-5 business days.\n" +
            "You will receive an email notification once the refund is processed.\n\n" +
            "Thank you for your patience.\n\n" +
            "Best regards,\n" +
            "CeyHarvest Support Team",
            data.get("refundId"),
            data.get("orderId"),
            data.get("refundAmount"),
            data.get("reason")
        );
    }

    private String generateRefundProcessedEmail(Map<String, Object> data) {
        return String.format(
            "Dear Customer,\n\n" +
            "Your refund has been processed successfully!\n\n" +
            "Refund Details:\n" +
            "Refund ID: %s\n" +
            "Refund Amount: LKR %.2f\n" +
            "Gateway Reference: %s\n\n" +
            "The refunded amount will appear in your original payment method within 5-10 business days.\n\n" +
            "Thank you for choosing CeyHarvest!\n\n" +
            "Best regards,\n" +
            "CeyHarvest Support Team",
            data.get("refundId"),
            data.get("refundAmount"),
            data.get("gatewayRefundId")
        );
    }

    private String generateRefundRejectedEmail(Map<String, Object> data) {
        return String.format(
            "Dear Customer,\n\n" +
            "After reviewing your refund request, we regret to inform you that it has been rejected.\n\n" +
            "Refund Details:\n" +
            "Refund ID: %s\n" +
            "Original Reason: %s\n\n" +
            "If you have any questions or would like to discuss this decision, " +
            "please contact our support team at support@ceyharvest.com.\n\n" +
            "Thank you for your understanding.\n\n" +
            "Best regards,\n" +
            "CeyHarvest Support Team",
            data.get("refundId"),
            data.get("reason")
        );
    }
}
```

### 4. **Advanced Controllers**

#### **A. Refund Controller**
```java
// controller/buyer/RefundController.java
package com.ceyharvest.ceyharvest.controller.buyer;

import com.ceyharvest.ceyharvest.document.Refund;
import com.ceyharvest.ceyharvest.service.RefundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buyer/refunds")
public class RefundController {

    @Autowired
    private RefundService refundService;

    /**
     * Request a refund
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> requestRefund(
            @RequestBody RefundRequest request,
            Authentication authentication) {
        
        try {
            String buyerEmail = authentication.getName();
            
            Refund refund = refundService.requestRefund(
                request.getOrderId(),
                request.getPaymentId(),
                request.getRefundAmount(),
                request.getReason(),
                "BUYER",
                buyerEmail
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("refund", refund);
            response.put("message", "Refund request submitted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get buyer's refunds
     */
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getBuyerRefunds(Authentication authentication) {
        try {
            String buyerEmail = authentication.getName();
            List<Refund> refunds = refundService.getRefundsByBuyer(buyerEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("refunds", refunds);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get refund details
     */
    @GetMapping("/{refundId}")
    public ResponseEntity<Map<String, Object>> getRefundDetails(
            @PathVariable String refundId,
            Authentication authentication) {
        
        try {
            Refund refund = refundService.getRefundById(refundId);
            if (refund == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Refund not found");
                return ResponseEntity.notFound().build();
            }
            
            // Verify refund belongs to this buyer
            if (!refund.getBuyerEmail().equals(authentication.getName())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Access denied");
                return ResponseEntity.status(403).body(response);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("refund", refund);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Request DTO
    public static class RefundRequest {
        private String orderId;
        private String paymentId;
        private double refundAmount;
        private String reason;

        // Getters and setters
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        
        public String getPaymentId() { return paymentId; }
        public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
        
        public double getRefundAmount() { return refundAmount; }
        public void setRefundAmount(double refundAmount) { this.refundAmount = refundAmount; }
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
```

#### **B. Notification Controller**
```java
// controller/NotificationController.java
package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.document.Notification;
import com.ceyharvest.ceyharvest.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get user notifications
     */
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getUserNotifications(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<Notification> notifications = notificationService.getNotificationsForUser(userEmail);
            long unreadCount = notificationService.getUnreadCount(userEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notifications", notifications);
            response.put("unreadCount", unreadCount);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Mark notification as read
     */
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable String notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification marked as read");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            long unreadCount = notificationService.getUnreadCount(userEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("unreadCount", unreadCount);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
```

## ✅ Advanced Features Implementation Checklist

### **Refund System**
- [ ] Create Refund entity and repository
- [ ] Implement RefundService with business logic
- [ ] Create refund request API endpoints
- [ ] Add admin refund management interface
- [ ] Integrate with Stripe refund API
- [ ] Add refund status tracking
- [ ] Implement refund notifications

### **Notification System**
- [ ] Create Notification entity and repository
- [ ] Implement NotificationService
- [ ] Create email template system
- [ ] Add notification API endpoints
- [ ] Implement real-time notifications (WebSocket)
- [ ] Add SMS notification support
- [ ] Create push notification system
- [ ] Add notification preferences

### **Enhanced User Experience**
- [ ] Add order tracking system
- [ ] Implement review and rating system
- [ ] Create customer support chat
- [ ] Add wishlist functionality
- [ ] Implement loyalty program
- [ ] Add delivery tracking
- [ ] Create analytics dashboard
