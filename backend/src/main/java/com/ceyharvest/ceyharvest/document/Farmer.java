package com.ceyharvest.ceyharvest.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "farmers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Farmer {
    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private String role = "FARMER";
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private String address;
    private String city;
    private String postalCode;
}