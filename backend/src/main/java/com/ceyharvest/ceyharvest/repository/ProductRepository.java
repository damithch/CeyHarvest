package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByFarmerId(String farmerId);
    Optional<Product> findById(String id);
}