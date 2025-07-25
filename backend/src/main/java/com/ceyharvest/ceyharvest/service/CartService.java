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
 * Service class for cart-related business logic
 */
@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get or create cart for a buyer
     */
    public Cart getOrCreateCart(String buyerEmail) {
        Optional<Cart> existingCart = cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE");
        
        if (existingCart.isPresent()) {
            return existingCart.get();
        }
        
        // Create new cart
        Cart newCart = new Cart();
        newCart.setBuyerEmail(buyerEmail);
        newCart.setTotalAmount(0.0);
        newCart.setTotalItems(0);
        newCart.setStatus("ACTIVE");
        newCart.setCreatedAt(LocalDateTime.now());
        newCart.setUpdatedAt(LocalDateTime.now());
        
        return cartRepository.save(newCart);
    }

    /**
     * Add product to cart
     */
    @Transactional
    public CartItem addToCart(String buyerEmail, String productId, int quantity) {
        // Validate product exists
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found");
        }
        
        Product product = productOpt.get();
        
        // Check if enough quantity is available
        if (product.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient quantity available. Available: " + product.getQuantity());
        }
        
        // Get or create cart
        Cart cart = getOrCreateCart(buyerEmail);
        
        // Check if item already exists in cart
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        
        CartItem cartItem;
        if (existingItemOpt.isPresent()) {
            // Update existing item
            cartItem = existingItemOpt.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            
            // Check total quantity doesn't exceed available stock
            if (newQuantity > product.getQuantity()) {
                throw new RuntimeException("Total quantity would exceed available stock. Available: " + product.getQuantity());
            }
            
            cartItem.setQuantity(newQuantity);
            cartItem.setTotalAmount(cartItem.getProductPrice() * newQuantity);
            cartItem.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setCartId(cart.getId());
            cartItem.setProductId(productId);
            cartItem.setFarmerId(product.getFarmerId());
            cartItem.setProductName(product.getName());
            cartItem.setProductPrice(product.getPrice());
            cartItem.setQuantity(quantity);
            cartItem.setTotalAmount(product.getPrice() * quantity);
            cartItem.setCategory(product.getCategory());
            cartItem.setImageBase64(product.getImageBase64());
            cartItem.setAddedAt(LocalDateTime.now());
            cartItem.setUpdatedAt(LocalDateTime.now());
        }
        
        cartItem = cartItemRepository.save(cartItem);
        
        // Update cart totals
        updateCartTotals(cart.getId());
        
        return cartItem;
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public CartItem updateCartItemQuantity(String buyerEmail, String productId, int newQuantity) {
        if (newQuantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }
        
        // Get buyer's cart
        Optional<Cart> cartOpt = cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE");
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart not found");
        }
        
        Cart cart = cartOpt.get();
        
        // Find cart item
        Optional<CartItem> cartItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        if (cartItemOpt.isEmpty()) {
            throw new RuntimeException("Item not found in cart");
        }
        
        CartItem cartItem = cartItemOpt.get();
        
        // Validate product availability
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found");
        }
        
        Product product = productOpt.get();
        if (product.getQuantity() < newQuantity) {
            throw new RuntimeException("Insufficient quantity available. Available: " + product.getQuantity());
        }
        
        // Update cart item
        cartItem.setQuantity(newQuantity);
        cartItem.setTotalAmount(cartItem.getProductPrice() * newQuantity);
        cartItem.setUpdatedAt(LocalDateTime.now());
        
        cartItem = cartItemRepository.save(cartItem);
        
        // Update cart totals
        updateCartTotals(cart.getId());
        
        return cartItem;
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public void removeFromCart(String buyerEmail, String productId) {
        // Get buyer's cart
        Optional<Cart> cartOpt = cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE");
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart not found");
        }
        
        Cart cart = cartOpt.get();
        
        // Remove item
        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        
        // Update cart totals
        updateCartTotals(cart.getId());
    }

    /**
     * Get cart with all items
     */
    public Cart getCartWithItems(String buyerEmail) {
        Optional<Cart> cartOpt = cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE");
        return cartOpt.orElse(null);
    }

    /**
     * Get all cart items for a buyer
     */
    public List<CartItem> getCartItems(String buyerEmail) {
        Cart cart = getOrCreateCart(buyerEmail);
        return cartItemRepository.findByCartId(cart.getId());
    }

    /**
     * Clear entire cart
     */
    @Transactional
    public void clearCart(String buyerEmail) {
        Optional<Cart> cartOpt = cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE");
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cartItemRepository.deleteByCartId(cart.getId());
            
            // Reset cart totals
            cart.setTotalAmount(0.0);
            cart.setTotalItems(0);
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        }
    }

    /**
     * Update cart totals based on current items
     */
    private void updateCartTotals(String cartId) {
        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        
        double totalAmount = items.stream()
            .mapToDouble(CartItem::getTotalAmount)
            .sum();
        
        int totalItems = items.stream()
            .mapToInt(CartItem::getQuantity)
            .sum();
        
        Optional<Cart> cartOpt = cartRepository.findById(cartId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cart.setTotalAmount(totalAmount);
            cart.setTotalItems(totalItems);
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        }
    }

    /**
     * Get cart summary for a buyer
     */
    public Cart getCartSummary(String buyerEmail) {
        return getOrCreateCart(buyerEmail);
    }
}
