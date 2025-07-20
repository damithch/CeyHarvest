package com.ceyharvest.ceyharvest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationDto {
    private String email;
    private String code;
    private String name;
    private String userType;  // Add userType field
}
