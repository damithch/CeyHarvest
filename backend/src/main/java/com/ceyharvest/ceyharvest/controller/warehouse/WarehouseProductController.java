package com.ceyharvest.ceyharvest.controller.warehouse;

import com.ceyharvest.ceyharvest.document.FarmerProductStock;
import com.ceyharvest.ceyharvest.document.Product;
import com.ceyharvest.ceyharvest.repository.FarmerProductStockRepository;
import com.ceyharvest.ceyharvest.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/warehouse/{warehouseId}/products")
public class WarehouseProductController {
    @Autowired
    private FarmerProductStockRepository farmerProductStockRepository;
    @Autowired
    private ProductRepository productRepository;

    // Add or update product stock for a farmer in this warehouse
    @PostMapping("/add")
    public ResponseEntity<?> addOrUpdateProductStock(@PathVariable String warehouseId, @RequestBody FarmerProductStock stock) {
        stock.setWarehouseId(warehouseId);
        // If productId+farmerId+warehouseId exists, update quantity and price
        List<FarmerProductStock> existing = farmerProductStockRepository.findByWarehouseIdAndProductId(warehouseId, stock.getProductId());
        Optional<FarmerProductStock> match = existing.stream().filter(s -> s.getFarmerId().equals(stock.getFarmerId())).findFirst();
        if (match.isPresent()) {
            FarmerProductStock s = match.get();
            s.setQuantity(s.getQuantity() + stock.getQuantity());
            s.setPrice(stock.getPrice()); // update to latest price
            s.setHarvestDay(stock.getHarvestDay());
            s.setShelfLife(stock.getShelfLife());
            s.setLocation(stock.getLocation());
            farmerProductStockRepository.save(s);
            return ResponseEntity.ok(s);
        } else {
            FarmerProductStock saved = farmerProductStockRepository.save(stock);
            return ResponseEntity.ok(saved);
        }
    }

    // List all products for this warehouse (with total stock and latest price)
    @GetMapping
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

    // Get all farmers who provided a specific product in this warehouse
    @GetMapping("/{productId}/farmers")
    public ResponseEntity<List<FarmerProductStock>> getFarmersForProduct(@PathVariable String warehouseId, @PathVariable String productId) {
        List<FarmerProductStock> stocks = farmerProductStockRepository.findByWarehouseIdAndProductId(warehouseId, productId);
        return ResponseEntity.ok(stocks);
    }

    // Get all products for a specific farmer in this warehouse (with total stock and latest price)
    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<FarmerProductStock>> getProductsForFarmer(@PathVariable String warehouseId, @PathVariable String farmerId) {
        List<FarmerProductStock> stocks = farmerProductStockRepository.findByWarehouseId(warehouseId).stream()
            .filter(s -> s.getFarmerId().equals(farmerId))
            .collect(Collectors.toList());
        return ResponseEntity.ok(stocks);
    }

    // Generate a simple receipt for a farmer's product addition
    @GetMapping("/receipt/{stockId}")
    public ResponseEntity<Map<String, Object>> generateReceipt(@PathVariable String warehouseId, @PathVariable String stockId) {
        Optional<FarmerProductStock> stockOpt = farmerProductStockRepository.findById(stockId);
        if (stockOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Stock not found"));
        }
        FarmerProductStock stock = stockOpt.get();
        Optional<Product> productOpt = productRepository.findById(stock.getProductId());
        String productName = productOpt.map(Product::getName).orElse("Unknown");
        Map<String, Object> receipt = new HashMap<>();
        receipt.put("farmerId", stock.getFarmerId());
        receipt.put("warehouseId", warehouseId);
        receipt.put("productId", stock.getProductId());
        receipt.put("productName", productName);
        receipt.put("quantity", stock.getQuantity());
        receipt.put("price", stock.getPrice());
        receipt.put("harvestDay", stock.getHarvestDay());
        receipt.put("shelfLife", stock.getShelfLife());
        receipt.put("location", stock.getLocation());
        receipt.put("receiptTime", new Date());
        return ResponseEntity.ok(receipt);
    }
} 