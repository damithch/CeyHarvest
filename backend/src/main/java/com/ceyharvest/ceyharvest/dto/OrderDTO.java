package com.ceyharvest.ceyharvest.dto;

import lombok.Data;

@Data
public class OrderDTO {
    private String productId;
    private String customerEmail;
    private int quantity;

    public String getProductId() {
        return productId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public int getQuantity() {
        return quantity;
    }
}