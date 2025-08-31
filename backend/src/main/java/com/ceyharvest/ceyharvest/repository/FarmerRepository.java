package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Farmer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FarmerRepository extends MongoRepository<Farmer, String> {
    Optional<Farmer> findByEmail(String email);
    Optional<Farmer> findFirstByPhoneNumber(String phoneNumber);
    List<Farmer> findByWarehouseIdsContaining(String warehouseId);
}