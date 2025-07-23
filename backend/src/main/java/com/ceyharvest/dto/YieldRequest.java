package com.ceyharvest.dto;

import lombok.Data;

@Data
public class YieldRequest {
    private String District;
    private int Major_Schemes_Sown;
    private int Minor_Schemes_Sown;
    private int Rainfed_Sown;
    private int All_Schemes_Sown;
    private int Nett_Extent_Harvested;
}
