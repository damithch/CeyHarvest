package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Warehouse;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface WarehouseRepository extends MongoRepository<Warehouse, String> {
    Optional<Warehouse> findByPhoneNumber(String phoneNumber);
} 