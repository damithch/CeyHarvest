package com.ceyharvest.ceyharvest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddCommentRequest {
    private String text;
    
    // Manual getters and setters
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
