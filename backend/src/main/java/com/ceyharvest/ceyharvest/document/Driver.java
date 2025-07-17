package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "drivers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Driver {
    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private String role = "DRIVER";
} 