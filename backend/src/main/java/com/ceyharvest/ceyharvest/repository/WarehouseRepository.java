package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Warehouse;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WarehouseRepository extends MongoRepository<Warehouse, String> {
    // Custom queries if needed
} 