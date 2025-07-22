package com.ceyharvest.ceyharvest.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "warehouses")
public class Warehouse {
    @Id
    private String id;
    private String district;
    private String address;
    private String phoneNumber;
    private String managerName;
    private String password;
    private String email;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
} 