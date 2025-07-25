package com.ceyharvest.ceyharvest.service;

import com.ceyharvest.ceyharvest.document.CropComment;
import com.ceyharvest.ceyharvest.document.CropPost;
import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.repository.CropPostRepository;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CropPostService {
    
    @Autowired
    private CropPostRepository cropPostRepository;
    
    @Autowired
    private FarmerRepository farmerRepository;
    
    /**
     * Create a new crop post
     */
    public CropPost createPost(String farmerId, String description, String imageBase64) {
        Optional<Farmer> farmerOpt = farmerRepository.findById(farmerId);
        if (!farmerOpt.isPresent()) {
            throw new RuntimeException("Farmer not found");
        }
        
        Farmer farmer = farmerOpt.get();
        CropPost post = new CropPost();
        post.setFarmerId(farmerId);
        post.setFarmerName(farmer.getFirstName() + " " + farmer.getLastName());
        post.setFarmerLocation(farmer.getCity());
        post.setDescription(description);
        post.setImageBase64(imageBase64);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        
        return cropPostRepository.save(post);
    }
    
    /**
     * Get all posts ordered by creation date (newest first)
     */
    public List<CropPost> getAllPosts() {
        return cropPostRepository.findAllByOrderByCreatedAtDesc();
    }
    
    /**
     * Get posts by farmer ID
     */
    public List<CropPost> getPostsByFarmerId(String farmerId) {
        return cropPostRepository.findByFarmerId(farmerId);
    }
    
    /**
     * Get a specific post by ID
     */
    public Optional<CropPost> getPostById(String postId) {
        return cropPostRepository.findById(postId);
    }
    
    /**
     * Like or unlike a post
     */
    public CropPost toggleLike(String postId, String userId) {
        Optional<CropPost> postOpt = cropPostRepository.findById(postId);
        if (!postOpt.isPresent()) {
            throw new RuntimeException("Post not found");
        }
        
        CropPost post = postOpt.get();
        List<String> likedByUserIds = post.getLikedByUserIds();
        
        if (likedByUserIds.contains(userId)) {
            // Unlike the post
            likedByUserIds.remove(userId);
            post.setLikes(post.getLikes() - 1);
        } else {
            // Like the post
            likedByUserIds.add(userId);
            post.setLikes(post.getLikes() + 1);
        }
        
        post.setUpdatedAt(LocalDateTime.now());
        return cropPostRepository.save(post);
    }
    
    /**
     * Add a comment to a post
     */
    public CropPost addComment(String postId, String userId, String userName, String commentText) {
        Optional<CropPost> postOpt = cropPostRepository.findById(postId);
        if (!postOpt.isPresent()) {
            throw new RuntimeException("Post not found");
        }
        
        CropPost post = postOpt.get();
        CropComment comment = new CropComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setUserId(userId);
        comment.setUserName(userName);
        comment.setText(commentText);
        comment.setCreatedAt(LocalDateTime.now());
        
        post.getComments().add(comment);
        post.setUpdatedAt(LocalDateTime.now());
        
        return cropPostRepository.save(post);
    }
    
    /**
     * Delete a post (only by the owner)
     */
    public boolean deletePost(String postId, String farmerId) {
        Optional<CropPost> postOpt = cropPostRepository.findById(postId);
        if (!postOpt.isPresent()) {
            return false;
        }
        
        CropPost post = postOpt.get();
        if (!post.getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Unauthorized to delete this post");
        }
        
        cropPostRepository.delete(post);
        return true;
    }
    
    /**
     * Get posts by location
     */
    public List<CropPost> getPostsByLocation(String location) {
        return cropPostRepository.findByFarmerLocationOrderByCreatedAtDesc(location);
    }
    
    /**
     * Search posts by description content
     */
    public List<CropPost> searchPosts(String searchText) {
        return cropPostRepository.findByDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(searchText);
    }
    
    /**
     * Get posts count for a farmer
     */
    public long getPostsCountByFarmerId(String farmerId) {
        return cropPostRepository.countByFarmerId(farmerId);
    }
}
