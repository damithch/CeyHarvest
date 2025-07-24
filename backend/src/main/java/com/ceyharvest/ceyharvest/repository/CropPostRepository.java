package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.CropPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropPostRepository extends MongoRepository<CropPost, String> {
    
    // Find all posts by a specific farmer
    List<CropPost> findByFarmerId(String farmerId);
    
    // Find all posts sorted by creation date (newest first)
    List<CropPost> findAllByOrderByCreatedAtDesc();
    
    // Find posts by farmer location
    List<CropPost> findByFarmerLocationOrderByCreatedAtDesc(String location);
    
    // Find posts containing specific text in description
    List<CropPost> findByDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(String searchText);
    
    // Count posts by farmer
    long countByFarmerId(String farmerId);
}
