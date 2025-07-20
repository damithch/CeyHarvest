package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {
    @Id
    private String id;
    private String username;
    private String password;
    
    @Indexed(unique = true)
    private String email;
    
    private String role = "ADMIN";
    private boolean emailVerified = true; // Admins are pre-verified
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 