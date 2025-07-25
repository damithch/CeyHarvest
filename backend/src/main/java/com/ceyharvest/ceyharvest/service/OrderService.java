package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public Cart getOrCreateCart(String buyerEmail) {
        Optional<Cart> existingCart = cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE");
        return existingCart.orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setBuyerEmail(buyerEmail);
            newCart.setTotalAmount(0.0);
            newCart.setTotalItems(0);
            newCart.setStatus("ACTIVE");
            newCart.setCreatedAt(LocalDateTime.now());
            newCart.setUpdatedAt(LocalDateTime.now());
            return cartRepository.save(newCart);
        });
    }

    @Transactional
    public CartItem addToCart(String buyerEmail, String productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getTotalStock() < quantity) {
            throw new RuntimeException("Insufficient quantity available");
        }

        Cart cart = getOrCreateCart(buyerEmail);
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        if (existingItemOpt.isPresent()) {
            CartItem cartItem = existingItemOpt.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            if (newQuantity > product.getTotalStock()) {
                throw new RuntimeException("Total quantity would exceed available stock");
            }
            cartItem.setQuantity(newQuantity);
            cartItem.setTotalAmount(cartItem.getProductPrice() * newQuantity);
            cartItem.setUpdatedAt(LocalDateTime.now());
            return cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setCartId(cart.getId());
            cartItem.setProductId(productId);
            cartItem.setFarmerId(product.getFarmerId());
            cartItem.setProductName(product.getProductName());
            cartItem.setProductPrice(product.getLatestPrice());
            cartItem.setQuantity(quantity);
            cartItem.setTotalAmount(product.getLatestPrice() * quantity);
            cartItem.setAddedAt(LocalDateTime.now());
            cartItem.setUpdatedAt(LocalDateTime.now());
            CartItem savedItem = cartItemRepository.save(cartItem);
            updateCartTotals(cart.getId());
            return savedItem;
        }
    }

    @Transactional
    public CartItem updateCartItemQuantity(String buyerEmail, String productId, int newQuantity) {
        if (newQuantity <= 0) {
            throw new RuntimeException("Quantity must be positive");
        }

        Cart cart = cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE")
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getTotalStock() < newQuantity) {
            throw new RuntimeException("Insufficient quantity available");
        }

        cartItem.setQuantity(newQuantity);
        cartItem.setTotalAmount(cartItem.getProductPrice() * newQuantity);
        cartItem.setUpdatedAt(LocalDateTime.now());

        CartItem updatedItem = cartItemRepository.save(cartItem);
        updateCartTotals(cart.getId());
        return updatedItem;
    }

    @Transactional
    public void removeFromCart(String buyerEmail, String productId) {
        Cart cart = cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE")
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        updateCartTotals(cart.getId());
    }

    public Cart getCartWithItems(String buyerEmail) {
        return cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE")
                .orElse(null);
    }

    public List<CartItem> getCartItems(String buyerEmail) {
        Cart cart = getOrCreateCart(buyerEmail);
        return cartItemRepository.findByCartId(cart.getId());
    }

    @Transactional
    public void clearCart(String buyerEmail) {
        cartRepository.findByBuyerEmailAndStatus(buyerEmail, "ACTIVE").ifPresent(cart -> {
            cartItemRepository.deleteByCartId(cart.getId());
            cart.setTotalAmount(0.0);
            cart.setTotalItems(0);
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        });
    }

    private void updateCartTotals(String cartId) {
        List<CartItem> items = cartItemRepository.findByCartId(cartId);

        double totalAmount = items.stream()
                .mapToDouble(CartItem::getTotalAmount)
                .sum();

        int totalItems = items.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        cartRepository.findById(cartId).ifPresent(cart -> {
            cart.setTotalAmount(totalAmount);
            cart.setTotalItems(totalItems);
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        });
    }
}