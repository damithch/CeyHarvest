package com.ceyharvest.ceyharvest.controller.dev;

import com.ceyharvest.ceyharvest.document.CropPost;
import com.ceyharvest.ceyharvest.document.CropComment;
import com.ceyharvest.ceyharvest.repository.CropPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dev/community")
public class CommunityTestDataController {
    
    @Autowired
    private CropPostRepository cropPostRepository;
    
    /**
     * Create sample community posts for testing
     */
    @PostMapping("/create-sample-posts")
    public ResponseEntity<Map<String, Object>> createSamplePosts() {
        try {
            // Clear existing posts
            cropPostRepository.deleteAll();
            
            // Create sample posts
            CropPost post1 = new CropPost();
            post1.setFarmerId("farmer1");
            post1.setFarmerName("Kamal Perera");
            post1.setFarmerLocation("Anuradhapura");
            post1.setDescription("My rice crop is looking great this season! The new fertilizer technique is working well. 🌾");
            post1.setImageBase64("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=");
            post1.setLikes(15);
            post1.setLikedByUserIds(Arrays.asList("farmer2", "farmer3"));
            post1.setCreatedAt(LocalDateTime.now().minusHours(2));
            post1.setUpdatedAt(LocalDateTime.now().minusHours(2));
            
            // Add comments to post1
            CropComment comment1 = new CropComment();
            comment1.setId("comment1");
            comment1.setUserId("farmer2");
            comment1.setUserName("Sunil Fernando");
            comment1.setText("Looking excellent! What fertilizer are you using?");
            comment1.setCreatedAt(LocalDateTime.now().minusHours(1));
            
            CropComment comment2 = new CropComment();
            comment2.setId("comment2");
            comment2.setUserId("farmer3");
            comment2.setUserName("Nimal Silva");
            comment2.setText("Great work! Hope you get a good harvest");
            comment2.setCreatedAt(LocalDateTime.now().minusMinutes(30));
            
            post1.setComments(Arrays.asList(comment1, comment2));
            
            // Create post 2
            CropPost post2 = new CropPost();
            post2.setFarmerId("farmer2");
            post2.setFarmerName("Sita Kumari");
            post2.setFarmerLocation("Kurunegala");
            post2.setDescription("Harvested my tomatoes today! Organic farming really pays off. 🍅");
            post2.setImageBase64("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=");
            post2.setLikes(23);
            post2.setLikedByUserIds(Arrays.asList("farmer1", "farmer3", "farmer4"));
            post2.setCreatedAt(LocalDateTime.now().minusDays(1));
            post2.setUpdatedAt(LocalDateTime.now().minusDays(1));
            
            // Add comment to post2
            CropComment comment3 = new CropComment();
            comment3.setId("comment3");
            comment3.setUserId("farmer1");
            comment3.setUserName("Priya Dissanayake");
            comment3.setText("Beautiful tomatoes! Do you sell them locally?");
            comment3.setCreatedAt(LocalDateTime.now().minusHours(20));
            
            post2.setComments(Arrays.asList(comment3));
            
            // Create post 3
            CropPost post3 = new CropPost();
            post3.setFarmerId("farmer3");
            post3.setFarmerName("Ranjan Mendis");
            post3.setFarmerLocation("Polonnaruwa");
            post3.setDescription("New irrigation system installed! Technology is transforming agriculture. 💧");
            post3.setImageBase64("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=");
            post3.setLikes(8);
            post3.setLikedByUserIds(Arrays.asList("farmer1"));
            post3.setCreatedAt(LocalDateTime.now().minusDays(2));
            post3.setUpdatedAt(LocalDateTime.now().minusDays(2));
            post3.setComments(new ArrayList<>());
            
            // Save all posts
            cropPostRepository.saveAll(Arrays.asList(post1, post2, post3));
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Sample community posts created successfully");
            response.put("postsCreated", 3);
            response.put("totalComments", 3);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create sample posts: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get community statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCommunityStats() {
        try {
            long totalPosts = cropPostRepository.count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPosts", totalPosts);
            stats.put("status", "Community features are working");
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to get stats: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Clear all community data
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllCommunityData() {
        try {
            cropPostRepository.deleteAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "All community data cleared successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to clear data: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
