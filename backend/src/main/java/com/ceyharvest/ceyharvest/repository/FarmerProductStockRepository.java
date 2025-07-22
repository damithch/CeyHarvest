package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.FarmerProductStock;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FarmerProductStockRepository extends MongoRepository<FarmerProductStock, String> {
    List<FarmerProductStock> findByWarehouseId(String warehouseId);
    List<FarmerProductStock> findByFarmerId(String farmerId);
    List<FarmerProductStock> findByProductId(String productId);
    List<FarmerProductStock> findByWarehouseIdAndProductId(String warehouseId, String productId);
} 