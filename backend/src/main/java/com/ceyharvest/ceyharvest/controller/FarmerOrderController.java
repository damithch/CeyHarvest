package com.ceyharvest.ceyharvest.controller;

import com.ceyharvest.ceyharvest.document.Order;
import com.ceyharvest.ceyharvest.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/farmer/{farmerId}")
public class FarmerOrderController {
    @Autowired
    private OrderRepository orderRepository;

    // Get all orders for a specific farmer
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getFarmerOrders(@PathVariable String farmerId) {
        List<Order> orders = orderRepository.findByFarmerId(farmerId);
        return ResponseEntity.ok(orders);
    }

    // Get farmer statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getFarmerStats(@PathVariable String farmerId) {
        List<Order> orders = orderRepository.findByFarmerId(farmerId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orders.size());
        stats.put("totalProducts", 0); // Will be calculated from products endpoint
        stats.put("totalRevenue", orders.stream()
            .mapToDouble(Order::getTotalPrice)
            .sum());
        stats.put("pendingOrders", orders.stream()
            .filter(order -> "PENDING".equals(order.getStatus()))
            .count());
        
        return ResponseEntity.ok(stats);
    }
}
