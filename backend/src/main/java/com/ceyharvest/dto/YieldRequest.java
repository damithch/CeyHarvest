package com.ceyharvest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class YieldRequest {
    @JsonProperty("District")
    private String District;
    
    @JsonProperty("Major_Schemes_Sown")
    private int Major_Schemes_Sown;
    
    @JsonProperty("Minor_Schemes_Sown")
    private int Minor_Schemes_Sown;
    
    @JsonProperty("Rainfed_Sown")
    private int Rainfed_Sown;
    
    @JsonProperty("All_Schemes_Sown")
    private int All_Schemes_Sown;
    
    @JsonProperty("Nett_Extent_Harvested")
    private int Nett_Extent_Harvested;
}
