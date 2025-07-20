package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "buyers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Buyer {
    @Id
    private String id;
    private String username;
    private String password;
    
    @Indexed(unique = true)
    private String email;
    
    private String role = "BUYER";
    
    // Profile fields
    private String firstName;
    private String lastName;
    
    @Indexed(unique = true, sparse = true)
    private String phoneNumber;
    
    private String address;
    private String city;
    private String postalCode;
    private String country;
    private boolean emailVerified = false; // Set to true after email verification
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 