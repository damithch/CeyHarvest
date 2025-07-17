package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AdminRepository extends MongoRepository<Admin, String> {
    Optional<Admin> findByEmail(String email);
} 