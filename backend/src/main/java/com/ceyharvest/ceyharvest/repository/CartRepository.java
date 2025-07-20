package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * Repository interface for Cart entity operations
 */
public interface CartRepository extends MongoRepository<Cart, String> {
    
    /**
     * Find active cart by buyer email
     * @param buyerEmail Email of the buyer
     * @return Optional Cart if found
     */
    Optional<Cart> findByBuyerEmailAndStatus(String buyerEmail, String status);
    
    /**
     * Find any cart (including inactive) by buyer email
     * @param buyerEmail Email of the buyer
     * @return Optional Cart if found
     */
    Optional<Cart> findByBuyerEmail(String buyerEmail);
    
    /**
     * Delete cart by buyer email
     * @param buyerEmail Email of the buyer
     */
    void deleteByBuyerEmail(String buyerEmail);
}
