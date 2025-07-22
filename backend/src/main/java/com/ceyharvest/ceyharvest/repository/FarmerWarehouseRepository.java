package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.FarmerWarehouse;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FarmerWarehouseRepository extends MongoRepository<FarmerWarehouse, String> {
    List<FarmerWarehouse> findByWarehouseId(String warehouseId);
    List<FarmerWarehouse> findByFarmerId(String farmerId);
} 