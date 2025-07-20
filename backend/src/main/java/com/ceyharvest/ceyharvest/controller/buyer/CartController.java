package com.ceyharvest.ceyharvest.controller.buyer;

import com.ceyharvest.ceyharvest.document.Cart;
import com.ceyharvest.ceyharvest.document.CartItem;
import com.ceyharvest.ceyharvest.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for cart management operations
 */
@RestController
@RequestMapping("/api/buyer/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * Get current buyer's cart with all items
     */
    @GetMapping
    public ResponseEntity<?> getCart() {
        try {
            String buyerEmail = getCurrentBuyerEmail();
            
            Cart cart = cartService.getCartSummary(buyerEmail);
            List<CartItem> items = cartService.getCartItems(buyerEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("cart", cart);
            response.put("items", items);
            response.put("itemCount", items.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving cart: " + e.getMessage());
        }
    }

    /**
     * Add product to cart
     */
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request) {
        try {
            String buyerEmail = getCurrentBuyerEmail();
            String productId = (String) request.get("productId");
            Integer quantity = (Integer) request.get("quantity");
            
            if (productId == null || quantity == null || quantity <= 0) {
                return ResponseEntity.badRequest().body("Product ID and valid quantity are required");
            }
            
            CartItem cartItem = cartService.addToCart(buyerEmail, productId, quantity);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product added to cart successfully");
            response.put("cartItem", cartItem);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding to cart: " + e.getMessage());
        }
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestBody Map<String, Object> request) {
        try {
            String buyerEmail = getCurrentBuyerEmail();
            String productId = (String) request.get("productId");
            Integer quantity = (Integer) request.get("quantity");
            
            if (productId == null || quantity == null || quantity <= 0) {
                return ResponseEntity.badRequest().body("Product ID and valid quantity are required");
            }
            
            CartItem cartItem = cartService.updateCartItemQuantity(buyerEmail, productId, quantity);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cart item updated successfully");
            response.put("cartItem", cartItem);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating cart item: " + e.getMessage());
        }
    }

    /**
     * Remove product from cart
     */
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable String productId) {
        try {
            String buyerEmail = getCurrentBuyerEmail();
            
            cartService.removeFromCart(buyerEmail, productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product removed from cart successfully");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error removing from cart: " + e.getMessage());
        }
    }

    /**
     * Clear entire cart
     */
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        try {
            String buyerEmail = getCurrentBuyerEmail();
            
            cartService.clearCart(buyerEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cart cleared successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error clearing cart: " + e.getMessage());
        }
    }

    /**
     * Get cart summary (totals only)
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getCartSummary() {
        try {
            String buyerEmail = getCurrentBuyerEmail();
            
            Cart cart = cartService.getCartSummary(buyerEmail);
            
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving cart summary: " + e.getMessage());
        }
    }

    /**
     * Get current buyer's email from JWT token
     */
    private String getCurrentBuyerEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
