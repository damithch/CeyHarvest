package com.ceyharvest.ceyharvest.controller.admin;

import com.ceyharvest.ceyharvest.document.Warehouse;
import com.ceyharvest.ceyharvest.document.FarmerProductStock;
import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.repository.WarehouseRepository;
import com.ceyharvest.ceyharvest.repository.FarmerProductStockRepository;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private FarmerProductStockRepository farmerProductStockRepository;
    @Autowired
    private ProductRepository productRepository;

    // List all warehouses
    @GetMapping("/warehouses")
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseRepository.findAll());
    }

    // Get warehouse info by id
    @GetMapping("/warehouses/{warehouseId}")
    public ResponseEntity<Warehouse> getWarehouseInfo(@PathVariable String warehouseId) {
        Optional<Warehouse> warehouse = warehouseRepository.findById(warehouseId);
        return warehouse.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get all products and stocks for a warehouse (same as warehouse dashboard)
    @GetMapping("/warehouses/{warehouseId}/products")
    public ResponseEntity<List<Map<String, Object>>> getAllProductsForWarehouse(@PathVariable String warehouseId) {
        List<FarmerProductStock> stocks = farmerProductStockRepository.findByWarehouseId(warehouseId);
        Map<String, List<FarmerProductStock>> byProduct = stocks.stream().collect(Collectors.groupingBy(FarmerProductStock::getProductId));
        List<Map<String, Object>> result = new ArrayList<>();
        for (String productId : byProduct.keySet()) {
            List<FarmerProductStock> productStocks = byProduct.get(productId);
            int totalStock = productStocks.stream().mapToInt(FarmerProductStock::getQuantity).sum();
            double latestPrice = productStocks.stream().max(Comparator.comparing(FarmerProductStock::getHarvestDay)).map(FarmerProductStock::getPrice).orElse(0.0);
            Optional<Product> productOpt = productRepository.findById(productId);
            String productName = productOpt.map(Product::getName).orElse("Unknown");
            Map<String, Object> info = new HashMap<>();
            info.put("productId", productId);
            info.put("productName", productName);
            info.put("totalStock", totalStock);
            info.put("latestPrice", latestPrice);
            result.add(info);
        }
        return ResponseEntity.ok(result);
    }
} 