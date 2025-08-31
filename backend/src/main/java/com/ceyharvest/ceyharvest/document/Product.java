package com.ceyharvest.ceyharvest.document;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
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

    @Getter @Setter
    private String name; // for getName()/setName()
    @Getter @Setter
    private String description; // for getDescription()/setDescription()
    @Getter @Setter
    private double price; // for getPrice()/setPrice()
    @Getter @Setter
    private int quantity; // for getQuantity()/setQuantity()
    @Getter @Setter
    private String category; // for getCategory()/setCategory()
    @Getter @Setter
    private String imageBase64; // for getImageBase64()/setImageBase64()

    @Data
    public static class PriceHistory {
        private double price;
        private int stockAdded;
        private LocalDateTime timestamp;
    }
}