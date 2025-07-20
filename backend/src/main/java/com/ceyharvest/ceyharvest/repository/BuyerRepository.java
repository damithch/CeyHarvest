package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Buyer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface BuyerRepository extends MongoRepository<Buyer, String> {
    Optional<Buyer> findByEmail(String email);
    Optional<Buyer> findFirstByPhoneNumber(String phoneNumber);
    Optional<Buyer> findByUsername(String username);
} 