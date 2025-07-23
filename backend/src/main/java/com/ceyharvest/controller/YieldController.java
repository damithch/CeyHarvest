package com.ceyharvest.controller;

import com.ceyharvest.dto.YieldRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/yield")
@CrossOrigin(origins = "http://localhost:5173")
public class YieldController {

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/predict")
    @SuppressWarnings("rawtypes")
    public ResponseEntity<Map<String, Object>> predictYield(
            @RequestBody YieldRequest input,
            Authentication authentication) {
        try {
            String flaskUrl = "http://localhost:5000/predict-yield";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<YieldRequest> request = new HttpEntity<>(input, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(flaskUrl, request, Map.class);
            Object prediction = response.getBody().get("predicted_yield");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "predicted_yield", prediction,
                "message", "Predicted Paddy Yield: " + prediction + " kg",
                "input_data", input,
                "user", authentication != null ? authentication.getName() : "anonymous"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "error", "Failed to get prediction: " + e.getMessage()
                ));
        }
    }
}
