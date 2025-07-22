package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.WarehouseManager;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WarehouseManagerRepository extends MongoRepository<WarehouseManager, String> {
    // Custom queries if needed
} 