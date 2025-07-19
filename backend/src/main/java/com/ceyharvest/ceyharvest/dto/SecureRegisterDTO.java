package com.ceyharvest.ceyharvest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SecureRegisterDTO {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username should be between 3 and 30 characters")
    private String username;

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name should not exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name should not exceed 50 characters")
    private String lastName;

    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email should not exceed 100 characters")
    private String email;

    @Size(max = 20, message = "Phone number should not exceed 20 characters")
    private String phoneNumber;

    @Size(max = 200, message = "Address should not exceed 200 characters")
    private String address;

    @Size(max = 50, message = "City should not exceed 50 characters")
    private String city;

    @Size(max = 10, message = "Postal code should not exceed 10 characters")
    private String postalCode;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 50, message = "Password should be between 6 and 50 characters")
    private String password;
}
