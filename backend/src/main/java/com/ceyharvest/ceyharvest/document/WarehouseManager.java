package com.ceyharvest.ceyharvest.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "warehouse_managers")
public class WarehouseManager {
    @Id
    private String id;
    private String name;
    private String phoneNumber;
    private String password;
    private String warehouseId;
    private String email;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getWarehouseId() { return warehouseId; }
    public void setWarehouseId(String warehouseId) { this.warehouseId = warehouseId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public WarehouseManager() {}
    public WarehouseManager(String id, String name, String phoneNumber, String email, String password, String warehouseId) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
        this.warehouseId = warehouseId;
    }
} 