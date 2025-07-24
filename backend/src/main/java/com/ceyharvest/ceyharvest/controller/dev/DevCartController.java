package com.ceyharvest.ceyharvest.controller.dev;

import com.ceyharvest.ceyharvest.document.Cart;
import com.ceyharvest.ceyharvest.document.CartItem;
import com.ceyharvest.ceyharvest.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Development Cart Controller for testing cart functionality without authentication
 * This controller should be removed in production
 */
@RestController
@RequestMapping("/api/dev/cart")
public class DevCartController {

    @Autowired
    private CartService cartService;

    /**
     * Get cart for test buyer
     */
    @GetMapping("/{buyerEmail}")
    public ResponseEntity<?> getCart(@PathVariable String buyerEmail) {
        try {
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
     * Add product to cart for test buyer
     */
    @PostMapping("/{buyerEmail}/add")
    public ResponseEntity<?> addToCart(@PathVariable String buyerEmail, @RequestBody Map<String, Object> request) {
        try {
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
     * Update cart item quantity for test buyer
     */
    @PutMapping("/{buyerEmail}/update")
    public ResponseEntity<?> updateCartItem(@PathVariable String buyerEmail, @RequestBody Map<String, Object> request) {
        try {
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
     * Remove product from cart for test buyer
     */
    @DeleteMapping("/{buyerEmail}/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable String buyerEmail, @PathVariable String productId) {
        try {
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
     * Clear entire cart for test buyer
     */
    @DeleteMapping("/{buyerEmail}/clear")
    public ResponseEntity<?> clearCart(@PathVariable String buyerEmail) {
        try {
            cartService.clearCart(buyerEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cart cleared successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error clearing cart: " + e.getMessage());
        }
    }
}
