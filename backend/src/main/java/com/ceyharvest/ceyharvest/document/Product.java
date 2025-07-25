package com.ceyharvest.ceyharvest.document;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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

    @NotBlank(message = "Farmer ID must not be blank")
    private String farmerId;

    @NotBlank(message = "Product name must not be blank")
    private String productName;

    @NotBlank(message = "Location must not be blank")
    private String location;

    @Min(value = 0, message = "Total stock cannot be negative")
    private int totalStock;

    @Min(value = 0, message = "Latest price cannot be negative")
    private double latestPrice;

    @NotNull(message = "Harvest day must not be null")
    private LocalDate harvestDay;

    @Min(value = 0, message = "Shelf life cannot be negative")
    private int shelfLife;

    private LocalDateTime createdAt = LocalDateTime.now();

    private List<PriceHistory> priceHistory;

    @Data
    public static class PriceHistory {
        @Min(value = 0, message = "Price cannot be negative")
        private double price;

        @Min(value = 0, message = "Stock added cannot be negative")
        private int stockAdded;

        private LocalDateTime timestamp;
    }
}
