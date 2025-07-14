package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.dto.LoginDTO;
import com.ceyharvest.ceyharvest.dto.LoginResponseDTO;
import com.ceyharvest.ceyharvest.dto.RegisterDTO;
import com.ceyharvest.ceyharvest.dto.OrderDTO;
import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDTO dto) {
        return ResponseEntity.ok(authService.registerFarmer(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginDTO dto) {
        return ResponseEntity.ok(authService.loginFarmer(dto));
    }

    @PostMapping("/update-product")
    public ResponseEntity<String> updateProduct(
            @RequestHeader("Authorization") String token,
            @RequestBody Product product) {
        String jwtToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token;
        return ResponseEntity.ok(authService.updateProduct(jwtToken, product));
    }

    @DeleteMapping("/delete-product/{productId}")
    public ResponseEntity<String> deleteProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable String productId) {
        String jwtToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token;
        return ResponseEntity.ok(authService.deleteProduct(jwtToken, productId));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestHeader("Authorization") String token) {
        String jwtToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token;
        return ResponseEntity.ok(authService.getProducts(jwtToken));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders(
            @RequestHeader("Authorization") String token) {
        String jwtToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token;
        return ResponseEntity.ok(authService.getOrders(jwtToken));
    }

    @PostMapping("/create-order")
    public ResponseEntity<String> createOrder(
            @RequestHeader("Authorization") String token,
            @RequestBody OrderDTO dto) {
        String jwtToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token;
        return ResponseEntity.ok(authService.createOrder(jwtToken, dto));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<String> refreshToken(
            @RequestHeader("Authorization") String refreshToken) {
        String jwtRefreshToken = refreshToken.startsWith("Bearer ") ? refreshToken.replace("Bearer ", "") : refreshToken;
        return ResponseEntity.ok(authService.refreshToken(jwtRefreshToken));
    }
}