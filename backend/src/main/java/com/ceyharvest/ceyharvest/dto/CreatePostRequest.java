package com.ceyharvest.ceyharvest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {
    private String description;
    private String imageBase64;
    
    // Manual getters and setters
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
}
