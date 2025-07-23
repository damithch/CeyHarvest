package com.ceyharvest.controller;

import com.ceyharvest.dto.YieldRequest;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/yield")
@CrossOrigin(origins = "http://localhost:5173")
public class YieldControllerMock {

    @PostMapping("/predict-mock")
    public ResponseEntity<Map<String, Object>> predictYieldMock(
            @RequestBody YieldRequest input,
            Authentication authentication) {
        
        // Mock calculation - simple formula for testing
        double mockYield = (input.getNett_Extent_Harvested() * 8.5) + 
                          (input.getMajor_Schemes_Sown() * 12.0) + 
                          (input.getMinor_Schemes_Sown() * 10.0);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "predicted_yield", mockYield,
            "message", "Predicted Paddy Yield: " + mockYield + " kg (MOCK)",
            "input_data", input,
            "note", "This is a mock response for testing. Start Flask ML API for real predictions.",
            "user", authentication != null ? authentication.getName() : "anonymous"
        ));
    }
}
