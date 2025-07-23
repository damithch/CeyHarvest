package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for order management and cart-to-order conversion
 */
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Create order from cart
     */
    @Transactional
    public Order createOrderFromCart(String buyerEmail, String deliveryAddress, String deliveryCity, 
                                   String deliveryPostalCode, String contactPhone, String instructions) {
        
        // Get buyer's cart
        Cart cart = cartService.getCartWithItems(buyerEmail);
        if (cart == null || cart.getTotalItems() == 0) {
            throw new RuntimeException("Cart is empty");
        }

        List<CartItem> cartItems = cartService.getCartItems(buyerEmail);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("No items in cart");
        }

        // Validate all products are still available
        for (CartItem cartItem : cartItems) {
            Optional<Product> productOpt = productRepository.findById(cartItem.getProductId());
            if (productOpt.isEmpty()) {
                throw new RuntimeException("Product not found: " + cartItem.getProductName());
            }
            
            Product product = productOpt.get();
            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient quantity for: " + cartItem.getProductName() + 
                    ". Available: " + product.getQuantity() + ", Requested: " + cartItem.getQuantity());
            }
        }

        // Create order
        Order order = new Order();
        order.setCustomerEmail(buyerEmail);
        order.setTotalAmount(cart.getTotalAmount());
        order.setStatus("PENDING");
        order.setPaymentStatus("PENDING");
        order.setDeliveryAddress(deliveryAddress);
        order.setDeliveryCity(deliveryCity);
        order.setDeliveryPostalCode(deliveryPostalCode);
        order.setContactPhone(contactPhone);
        order.setInstructions(instructions);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        // Set expected delivery date (7 days from now)
        order.setExpectedDeliveryDate(LocalDateTime.now().plusDays(7));
        
        Order savedOrder = orderRepository.save(order);

        // Create order items from cart items
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(savedOrder.getId());
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setFarmerId(cartItem.getFarmerId());
            orderItem.setProductName(cartItem.getProductName());
            orderItem.setProductPrice(cartItem.getProductPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setTotalAmount(cartItem.getTotalAmount());
            orderItem.setCategory(cartItem.getCategory());
            orderItem.setImageBase64(cartItem.getImageBase64());
            orderItem.setStatus("PENDING");
            orderItem.setCreatedAt(LocalDateTime.now());
            orderItem.setUpdatedAt(LocalDateTime.now());
            
            orderItemRepository.save(orderItem);
        }

        // Reserve inventory (reduce product quantities)
        for (CartItem cartItem : cartItems) {
            Optional<Product> productOpt = productRepository.findById(cartItem.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                product.setQuantity(product.getQuantity() - cartItem.getQuantity());
                productRepository.save(product);
            }
        }

        // Clear the cart after successful order creation
        cartService.clearCart(buyerEmail);

        return savedOrder;
    }

    /**
     * Get order with items
     */
    public Order getOrderWithItems(String orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        return orderOpt.orElse(null);
    }

    /**
     * Get order items for an order
     */
    public List<OrderItem> getOrderItems(String orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    /**
     * Update order status
     */
    public Order updateOrderStatus(String orderId, String status) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found");
        }
        
        Order order = orderOpt.get();
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        
        return orderRepository.save(order);
    }

    /**
     * Update payment status
     */
    public Order updatePaymentStatus(String orderId, String paymentStatus, String paymentId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found");
        }
        
        Order order = orderOpt.get();
        order.setPaymentStatus(paymentStatus);
        if (paymentId != null) {
            order.setPaymentId(paymentId);
        }
        order.setUpdatedAt(LocalDateTime.now());
        
        // If payment is successful, confirm the order
        if ("PAID".equals(paymentStatus)) {
            order.setStatus("CONFIRMED");
        }
        
        return orderRepository.save(order);
    }

    /**
     * Get orders by customer email
     */
    public List<Order> getOrdersByCustomer(String customerEmail) {
        return orderRepository.findByCustomerEmail(customerEmail);
    }

    /**
     * Cancel order (if not yet confirmed)
     */
    @Transactional
    public Order cancelOrder(String orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found");
        }
        
        Order order = orderOpt.get();
        if ("CONFIRMED".equals(order.getStatus()) || "PROCESSING".equals(order.getStatus())) {
            throw new RuntimeException("Cannot cancel order that is already confirmed or processing");
        }
        
        // Restore inventory
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        for (OrderItem orderItem : orderItems) {
            Optional<Product> productOpt = productRepository.findById(orderItem.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                product.setQuantity(product.getQuantity() + orderItem.getQuantity());
                productRepository.save(product);
            }
        }
        
        order.setStatus("CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());
        
        return orderRepository.save(order);
    }
}
