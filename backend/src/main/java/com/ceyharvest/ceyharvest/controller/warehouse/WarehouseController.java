package com.ceyharvest.ceyharvest.controller.warehouse;

import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {
    @Autowired
    private FarmerRepository farmerRepository;

    /**
     * Get all farmers for a warehouse, with optional search and sort
     */
    @GetMapping("/{warehouseId}/farmers")
    public ResponseEntity<?> getFarmersForWarehouse(
            @PathVariable String warehouseId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        // Debug: print current user's authorities
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] Authenticated user: " + (auth != null ? auth.getName() : "null"));
        System.out.println("[DEBUG] Authorities: " + (auth != null ? auth.getAuthorities() : "null"));
        List<Farmer> farmers = farmerRepository.findByWarehouseIdsContaining(warehouseId);

        // Filter by search if provided
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase(Locale.ROOT);
            farmers = farmers.stream().filter(farmer ->
                (farmer.getFirstName() != null && farmer.getFirstName().toLowerCase().contains(searchLower)) ||
                (farmer.getLastName() != null && farmer.getLastName().toLowerCase().contains(searchLower)) ||
                (farmer.getEmail() != null && farmer.getEmail().toLowerCase().contains(searchLower)) ||
                (farmer.getPhoneNumber() != null && farmer.getPhoneNumber().contains(search)) ||
                (farmer.getUsername() != null && farmer.getUsername().toLowerCase().contains(searchLower))
            ).collect(Collectors.toList());
        }

        // Sort
        Comparator<Farmer> comparator;
        switch (sortBy) {
            case "firstName":
                comparator = Comparator.comparing(Farmer::getFirstName, Comparator.nullsLast(String::compareTo));
                break;
            case "lastName":
                comparator = Comparator.comparing(Farmer::getLastName, Comparator.nullsLast(String::compareTo));
                break;
            case "email":
                comparator = Comparator.comparing(Farmer::getEmail, Comparator.nullsLast(String::compareTo));
                break;
            case "phoneNumber":
                comparator = Comparator.comparing(Farmer::getPhoneNumber, Comparator.nullsLast(String::compareTo));
                break;
            case "createdAt":
            default:
                comparator = Comparator.comparing(Farmer::getCreatedAt, Comparator.nullsLast((a, b) -> {
                    if (a == null && b == null) return 0;
                    if (a == null) return -1;
                    if (b == null) return 1;
                    return a.compareTo(b);
                }));
                break;
        }
        if (sortDir.equalsIgnoreCase("desc")) {
            comparator = comparator.reversed();
        }
        farmers = farmers.stream().sorted(comparator).collect(Collectors.toList());

        return ResponseEntity.ok(farmers);
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<?> getFarmerById(@PathVariable String farmerId) {
        return farmerRepository.findById(farmerId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
} 