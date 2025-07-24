package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "crop_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CropPost {
    @Id
    private String id;
    
    private String farmerId;
    private String farmerName;
    private String farmerLocation;
    
    private String description;
    private String imageBase64; // Store image as base64 string
    
    private int likes = 0;
    private List<String> likedByUserIds = new ArrayList<>();
    private List<CropComment> comments = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Manual getters and setters for compatibility
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }
    
    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }
    
    public String getFarmerLocation() { return farmerLocation; }
    public void setFarmerLocation(String farmerLocation) { this.farmerLocation = farmerLocation; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
    
    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }
    
    public List<String> getLikedByUserIds() { return likedByUserIds; }
    public void setLikedByUserIds(List<String> likedByUserIds) { this.likedByUserIds = likedByUserIds; }
    
    public List<CropComment> getComments() { return comments; }
    public void setComments(List<CropComment> comments) { this.comments = comments; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
