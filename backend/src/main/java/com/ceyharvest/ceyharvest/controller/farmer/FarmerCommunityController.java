package com.ceyharvest.ceyharvest.controller.farmer;

import com.ceyharvest.ceyharvest.document.CropPost;
import com.ceyharvest.ceyharvest.dto.AddCommentRequest;
import com.ceyharvest.ceyharvest.dto.CreatePostRequest;
import com.ceyharvest.ceyharvest.service.CropPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farmer/{farmerId}/community")
@CrossOrigin(origins = "*")
public class FarmerCommunityController {
    
    @Autowired
    private CropPostService cropPostService;
    
    /**
     * Get all posts for the community feed
     */
    @GetMapping("/feed")
    public ResponseEntity<List<CropPost>> getCommunityFeed(@PathVariable String farmerId) {
        try {
            List<CropPost> posts = cropPostService.getAllPosts();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get farmer's own posts
     */
    @GetMapping("/posts")
    public ResponseEntity<List<CropPost>> getMyPosts(@PathVariable String farmerId) {
        try {
            List<CropPost> posts = cropPostService.getPostsByFarmerId(farmerId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Create a new post
     */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@PathVariable String farmerId,
                                       @RequestBody CreatePostRequest request) {
        try {
            if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Description is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            CropPost createdPost = cropPostService.createPost(
                farmerId,
                request.getDescription(),
                request.getImageBase64()
            );
            
            return ResponseEntity.ok(createdPost);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create post");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Like/unlike a post
     */
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<?> toggleLike(@PathVariable String farmerId,
                                       @PathVariable String postId) {
        try {
            CropPost updatedPost = cropPostService.toggleLike(postId, farmerId);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to toggle like");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Add comment to a post
     */
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> addComment(@PathVariable String farmerId,
                                       @PathVariable String postId,
                                       @RequestBody AddCommentRequest request) {
        try {
            if (request.getText() == null || request.getText().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Comment text is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            // For farmer endpoints, we'll use farmerId as userId and get the name from the service
            CropPost updatedPost = cropPostService.addComment(
                postId,
                farmerId,
                "Farmer", // This will be updated in the service to get actual name
                request.getText()
            );
            
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add comment");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Delete a post
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String farmerId,
                                       @PathVariable String postId) {
        try {
            boolean deleted = cropPostService.deletePost(postId, farmerId);
            if (deleted) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Post deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete post");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get community statistics for farmer
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCommunityStats(@PathVariable String farmerId) {
        try {
            long postsCount = cropPostService.getPostsCountByFarmerId(farmerId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPosts", postsCount);
            stats.put("totalCommunityPosts", cropPostService.getAllPosts().size());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
