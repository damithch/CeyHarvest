package com.ceyharvest.ceyharvest.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "farmer_product_stocks")
public class FarmerProductStock {
    @Id
    private String id;
    private String farmerId;
    private String warehouseId;
    private String productId;
    private int quantity;
    private Date harvestDay;
    private int shelfLife;
    private double price;
    private String location;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }
    public String getWarehouseId() { return warehouseId; }
    public void setWarehouseId(String warehouseId) { this.warehouseId = warehouseId; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public Date getHarvestDay() { return harvestDay; }
    public void setHarvestDay(Date harvestDay) { this.harvestDay = harvestDay; }
    public int getShelfLife() { return shelfLife; }
    public void setShelfLife(int shelfLife) { this.shelfLife = shelfLife; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
} 