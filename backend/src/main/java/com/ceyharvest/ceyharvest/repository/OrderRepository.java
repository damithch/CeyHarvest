package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByFarmerId(String farmerId);
    List<Order> findByCustomerEmail(String customerEmail);
}