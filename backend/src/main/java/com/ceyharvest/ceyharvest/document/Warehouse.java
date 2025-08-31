package com.ceyharvest.ceyharvest.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "warehouses")
public class Warehouse {
    @Id
    private String id;
    private String managerName;
    private String district;
    private String address;
    private String phoneNumber;
    private String password; // hashed
    private LocalDateTime createdAt = LocalDateTime.now();
} 