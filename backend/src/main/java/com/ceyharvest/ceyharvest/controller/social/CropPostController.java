package com.ceyharvest.ceyharvest.controller.social;

import com.ceyharvest.ceyharvest.document.CropPost;
import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.dto.AddCommentRequest;
import com.ceyharvest.ceyharvest.dto.CreatePostRequest;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import com.ceyharvest.ceyharvest.service.CropPostService;
import com.ceyharvest.ceyharvest.util.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
public class CropPostController {
    
    @Autowired
    private CropPostService cropPostService;
    
    @Autowired
    private FarmerRepository farmerRepository;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    
    /**
     * Extract user ID from JWT token in Authorization header
     */
    private String extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        return jwtTokenUtil.extractUserId(token);
    }
    
    /**
     * Get all crop posts (community feed)
     */
    @GetMapping("/posts")
    public ResponseEntity<List<CropPost>> getAllPosts() {
        try {
            List<CropPost> posts = cropPostService.getAllPosts();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Create a new crop post
     */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody CreatePostRequest request, 
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            String farmerId = extractUserIdFromToken(authHeader);
            
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
     * Get posts by farmer ID
     */
    @GetMapping("/posts/farmer/{farmerId}")
    public ResponseEntity<List<CropPost>> getPostsByFarmerId(@PathVariable String farmerId) {
        try {
            List<CropPost> posts = cropPostService.getPostsByFarmerId(farmerId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get a specific post by ID
     */
    @GetMapping("/posts/{postId}")
    public ResponseEntity<CropPost> getPostById(@PathVariable String postId) {
        try {
            Optional<CropPost> post = cropPostService.getPostById(postId);
            if (post.isPresent()) {
                return ResponseEntity.ok(post.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Like or unlike a post
     */
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<?> toggleLike(@PathVariable String postId, 
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserIdFromToken(authHeader);
            CropPost updatedPost = cropPostService.toggleLike(postId, userId);
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
     * Add a comment to a post
     */
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> addComment(@PathVariable String postId,
                                       @RequestBody AddCommentRequest request,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserIdFromToken(authHeader);
            
            if (request.getText() == null || request.getText().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Comment text is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Get user name from farmer repository
            Optional<Farmer> farmerOpt = farmerRepository.findById(userId);
            String userName = "Unknown User";
            if (farmerOpt.isPresent()) {
                Farmer farmer = farmerOpt.get();
                userName = farmer.getFirstName() + " " + farmer.getLastName();
            }
            
            CropPost updatedPost = cropPostService.addComment(
                postId, 
                userId, 
                userName, 
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
     * Delete a post (only by the owner)
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            String farmerId = extractUserIdFromToken(authHeader);
            boolean deleted = cropPostService.deletePost(postId, farmerId);
            if (deleted) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Post deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Post not found");
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
     * Search posts by content
     */
    @GetMapping("/posts/search")
    public ResponseEntity<List<CropPost>> searchPosts(@RequestParam String q) {
        try {
            List<CropPost> posts = cropPostService.searchPosts(q);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get posts by location
     */
    @GetMapping("/posts/location/{location}")
    public ResponseEntity<List<CropPost>> getPostsByLocation(@PathVariable String location) {
        try {
            List<CropPost> posts = cropPostService.getPostsByLocation(location);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get farmer's post statistics
     */
    @GetMapping("/farmer/{farmerId}/stats")
    public ResponseEntity<Map<String, Object>> getFarmerStats(@PathVariable String farmerId) {
        try {
            long postsCount = cropPostService.getPostsCountByFarmerId(farmerId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPosts", postsCount);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
