package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.dto.LoginDTO;
import com.ceyharvest.ceyharvest.dto.LoginResponseDTO;
import com.ceyharvest.ceyharvest.dto.RegisterDTO;
import com.ceyharvest.ceyharvest.dto.OrderDTO;
import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import com.ceyharvest.ceyharvest.repository.OrderRepository;
import com.ceyharvest.ceyharvest.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final FarmerRepository farmerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String registerFarmer(RegisterDTO dto) {
        if (farmerRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Farmer farmer = new Farmer();
        farmer.setUsername(dto.getUsername());
        farmer.setEmail(dto.getEmail());
        farmer.setPassword(passwordEncoder.encode(dto.getPassword()));
        farmer.setRole("FARMER");

        farmerRepository.save(farmer);
        return "Farmer registered successfully";
    }

    public LoginResponseDTO loginFarmer(LoginDTO dto) {
        Farmer farmer = farmerRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(dto.getPassword(), farmer.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(farmer.getEmail(), farmer.getId(), farmer.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(farmer.getEmail(), farmer.getId(), farmer.getRole());
        LoginResponseDTO response = new LoginResponseDTO();
        response.setToken(token);
        response.setRefreshToken(refreshToken);
        response.setUsername(farmer.getUsername());
        response.setEmail(farmer.getEmail());
        return response;
    }

    public String updateProduct(String token, Product product) {
        String email = jwtUtil.getEmailFromToken(token);
        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        product.setFarmerId(farmer.getId());
        productRepository.save(product);
        return "Product updated successfully";
    }

    public String deleteProduct(String token, String productId) {
        String email = jwtUtil.getEmailFromToken(token);
        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getFarmerId().equals(farmer.getId())) {
            throw new RuntimeException("Unauthorized to delete this product");
        }

        productRepository.deleteById(productId);
        return "Product deleted successfully";
    }

    public List<Product> getProducts(String token) {
        String email = jwtUtil.getEmailFromToken(token);
        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        return productRepository.findByFarmerId(farmer.getId());
    }

    public List<Order> getOrders(String token) {
        String email = jwtUtil.getEmailFromToken(token);
        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        return orderRepository.findByFarmerId(farmer.getId());
    }

    public String createOrder(String token, OrderDTO dto) {
        String email = jwtUtil.getEmailFromToken(token);
        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getFarmerId().equals(farmer.getId())) {
            throw new RuntimeException("Unauthorized to order this product");
        }

        Order order = new Order();
        order.setFarmerId(farmer.getId());
        order.setProductId(dto.getProductId());
        order.setCustomerEmail(dto.getCustomerEmail());
        order.setQuantity(dto.getQuantity());
        order.setTotalPrice(product.getPrice() * dto.getQuantity());
        order.setStatus("PENDING");
        order.setOrderDate(new Date().toString());
        orderRepository.save(order);
        return "Order created successfully";
    }

    public String refreshToken(String refreshToken) {
        if (jwtUtil.validateToken(refreshToken)) {
            String email = jwtUtil.getEmailFromToken(refreshToken);
            Farmer farmer = farmerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Farmer not found"));
            return jwtUtil.generateToken(email, farmer.getId(), farmer.getRole());
        }
        throw new RuntimeException("Invalid refresh token");
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Farmer not found with email: " + email));
        return new User(farmer.getEmail(), farmer.getPassword(), new ArrayList<>());
    }
}