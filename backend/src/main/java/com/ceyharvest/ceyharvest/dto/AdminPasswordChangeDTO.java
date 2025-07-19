package com.ceyharvest.ceyharvest.dto;

import lombok.Data;

@Data
public class AdminPasswordChangeDTO {
    private String email;
    private String oldPassword;
    private String newPassword;
}
