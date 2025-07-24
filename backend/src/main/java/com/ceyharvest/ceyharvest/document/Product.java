package com.ceyharvest.ceyharvest.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String farmerId;
    private String productName;
    private String location;
    private int totalStock;
    private double latestPrice;
    private LocalDate harvestDay;
    private int shelfLife;
    private LocalDateTime createdAt = LocalDateTime.now();
    private List<PriceHistory> priceHistory;

    @Data
    public static class PriceHistory {
        private double price;
        private int stockAdded;
        private LocalDateTime timestamp;
    }
}