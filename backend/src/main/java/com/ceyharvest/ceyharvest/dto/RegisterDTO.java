package com.ceyharvest.ceyharvest.dto;

import lombok.Data;

@Data
public class RegisterDTO {
    private String username;
    private String email;
    private String password;

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}