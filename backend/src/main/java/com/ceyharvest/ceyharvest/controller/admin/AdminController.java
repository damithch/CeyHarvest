package com.ceyharvest.ceyharvest.controller.admin;

import com.ceyharvest.ceyharvest.document.*;
import com.ceyharvest.ceyharvest.repository.*;
import com.ceyharvest.ceyharvest.dto.WarehouseRegisterDTO;
import com.ceyharvest.ceyharvest.document.Warehouse;
import com.ceyharvest.ceyharvest.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private FarmerRepository farmerRepository;
    
    @Autowired
    private BuyerRepository buyerRepository;
    
    @Autowired
    private DriverRepository driverRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Get all farmers with comprehensive details
     */
    @GetMapping("/users/farmers")
    public ResponseEntity<?> getAllFarmers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            List<Farmer> farmers = farmerRepository.findAll(
                Sort.by(sortDir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy)
            );
            
            // Apply search filter if provided
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                farmers = farmers.stream()
                    .filter(farmer -> 
                        (farmer.getFirstName() != null && farmer.getFirstName().toLowerCase().contains(searchLower)) ||
                        (farmer.getLastName() != null && farmer.getLastName().toLowerCase().contains(searchLower)) ||
                        (farmer.getEmail() != null && farmer.getEmail().toLowerCase().contains(searchLower)) ||
                        (farmer.getPhoneNumber() != null && farmer.getPhoneNumber().contains(search)) ||
                        (farmer.getUsername() != null && farmer.getUsername().toLowerCase().contains(searchLower)) ||
                        (farmer.getCity() != null && farmer.getCity().toLowerCase().contains(searchLower))
                    )
                    .collect(Collectors.toList());
            }
            
            // Convert to detailed response format
            List<Map<String, Object>> farmersDetails = farmers.stream()
                .map(this::convertFarmerToDetailedMap)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", farmersDetails);
            response.put("totalCount", farmersDetails.size());
            response.put("userType", "FARMER");
            response.put("page", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching farmers: " + e.getMessage());
        }
    }

    /**
     * Get all buyers with comprehensive details
     */
    @GetMapping("/users/buyers")
    public ResponseEntity<?> getAllBuyers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            List<Buyer> buyers = buyerRepository.findAll(
                Sort.by(sortDir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy)
            );
            
            // Apply search filter if provided
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                buyers = buyers.stream()
                    .filter(buyer -> 
                        (buyer.getFirstName() != null && buyer.getFirstName().toLowerCase().contains(searchLower)) ||
                        (buyer.getLastName() != null && buyer.getLastName().toLowerCase().contains(searchLower)) ||
                        (buyer.getEmail() != null && buyer.getEmail().toLowerCase().contains(searchLower)) ||
                        (buyer.getPhoneNumber() != null && buyer.getPhoneNumber().contains(search)) ||
                        (buyer.getUsername() != null && buyer.getUsername().toLowerCase().contains(searchLower)) ||
                        (buyer.getCity() != null && buyer.getCity().toLowerCase().contains(searchLower)) ||
                        (buyer.getCountry() != null && buyer.getCountry().toLowerCase().contains(searchLower))
                    )
                    .collect(Collectors.toList());
            }
            
            // Convert to detailed response format
            List<Map<String, Object>> buyersDetails = buyers.stream()
                .map(this::convertBuyerToDetailedMap)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", buyersDetails);
            response.put("totalCount", buyersDetails.size());
            response.put("userType", "BUYER");
            response.put("page", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching buyers: " + e.getMessage());
        }
    }

    /**
     * Get all drivers with comprehensive details
     */
    @GetMapping("/users/drivers")
    public ResponseEntity<?> getAllDrivers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            List<Driver> drivers = driverRepository.findAll(
                Sort.by(sortDir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy)
            );
            
            // Apply search filter if provided
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                drivers = drivers.stream()
                    .filter(driver -> 
                        (driver.getFirstName() != null && driver.getFirstName().toLowerCase().contains(searchLower)) ||
                        (driver.getLastName() != null && driver.getLastName().toLowerCase().contains(searchLower)) ||
                        (driver.getEmail() != null && driver.getEmail().toLowerCase().contains(searchLower)) ||
                        (driver.getPhoneNumber() != null && driver.getPhoneNumber().contains(search)) ||
                        (driver.getUsername() != null && driver.getUsername().toLowerCase().contains(searchLower)) ||
                        (driver.getCity() != null && driver.getCity().toLowerCase().contains(searchLower))
                    )
                    .collect(Collectors.toList());
            }
            
            // Convert to detailed response format
            List<Map<String, Object>> driversDetails = drivers.stream()
                .map(this::convertDriverToDetailedMap)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", driversDetails);
            response.put("totalCount", driversDetails.size());
            response.put("userType", "DRIVER");
            response.put("page", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching drivers: " + e.getMessage());
        }
    }

    /**
     * Get all users across all types
     */
    @GetMapping("/users/all")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String userType,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            List<Map<String, Object>> allUsers = new ArrayList<>();
            
            // Get all user types unless specific type is requested
            if (userType == null || userType.equals("FARMER")) {
                List<Farmer> farmers = farmerRepository.findAll();
                allUsers.addAll(farmers.stream()
                    .map(this::convertFarmerToDetailedMap)
                    .collect(Collectors.toList()));
            }
            
            if (userType == null || userType.equals("BUYER")) {
                List<Buyer> buyers = buyerRepository.findAll();
                allUsers.addAll(buyers.stream()
                    .map(this::convertBuyerToDetailedMap)
                    .collect(Collectors.toList()));
            }
            
            if (userType == null || userType.equals("DRIVER")) {
                List<Driver> drivers = driverRepository.findAll();
                allUsers.addAll(drivers.stream()
                    .map(this::convertDriverToDetailedMap)
                    .collect(Collectors.toList()));
            }
            
            if (userType == null || userType.equals("ADMIN")) {
                List<Admin> admins = adminRepository.findAll();
                allUsers.addAll(admins.stream()
                    .map(this::convertAdminToDetailedMap)
                    .collect(Collectors.toList()));
            }
            
            // Apply search filter if provided
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                allUsers = allUsers.stream()
                    .filter(user -> {
                        String firstName = (String) user.get("firstName");
                        String lastName = (String) user.get("lastName");
                        String email = (String) user.get("email");
                        String phone = (String) user.get("phoneNumber");
                        String username = (String) user.get("username");
                        String city = (String) user.get("city");
                        String role = (String) user.get("role");
                        
                        return (firstName != null && firstName.toLowerCase().contains(searchLower)) ||
                               (lastName != null && lastName.toLowerCase().contains(searchLower)) ||
                               (email != null && email.toLowerCase().contains(searchLower)) ||
                               (phone != null && phone.contains(search)) ||
                               (username != null && username.toLowerCase().contains(searchLower)) ||
                               (city != null && city.toLowerCase().contains(searchLower)) ||
                               (role != null && role.toLowerCase().contains(searchLower));
                    })
                    .collect(Collectors.toList());
            }
            
            // Sort the combined list
            allUsers.sort((u1, u2) -> {
                Object date1 = u1.get(sortBy);
                Object date2 = u2.get(sortBy);
                
                if (date1 instanceof LocalDateTime && date2 instanceof LocalDateTime) {
                    return sortDir.equals("desc") ? 
                        ((LocalDateTime) date2).compareTo((LocalDateTime) date1) :
                        ((LocalDateTime) date1).compareTo((LocalDateTime) date2);
                }
                
                // Fallback to string comparison
                String str1 = date1 != null ? date1.toString() : "";
                String str2 = date2 != null ? date2.toString() : "";
                return sortDir.equals("desc") ? str2.compareTo(str1) : str1.compareTo(str2);
            });
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", allUsers);
            response.put("totalCount", allUsers.size());
            response.put("userType", "ALL");
            response.put("page", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching all users: " + e.getMessage());
        }
    }

    /**
     * Get user statistics for admin dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalFarmers", farmerRepository.count());
            stats.put("totalBuyers", buyerRepository.count());
            stats.put("totalDrivers", driverRepository.count());
            stats.put("totalAdmins", adminRepository.count());
            stats.put("totalUsers", farmerRepository.count() + buyerRepository.count() + 
                                   driverRepository.count() + adminRepository.count());
            
            // Verification statistics
            long verifiedFarmers = farmerRepository.findAll().stream()
                .mapToLong(f -> f.isEmailVerified() ? 1 : 0).sum();
            long verifiedBuyers = buyerRepository.findAll().stream()
                .mapToLong(b -> b.isEmailVerified() ? 1 : 0).sum();
            long verifiedDrivers = driverRepository.findAll().stream()
                .mapToLong(d -> d.isEmailVerified() ? 1 : 0).sum();
            
            stats.put("verifiedFarmers", verifiedFarmers);
            stats.put("verifiedBuyers", verifiedBuyers);
            stats.put("verifiedDrivers", verifiedDrivers);
            stats.put("totalVerifiedUsers", verifiedFarmers + verifiedBuyers + verifiedDrivers);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching admin stats: " + e.getMessage());
        }
    }

    /**
     * Export users data as CSV
     */
    @GetMapping("/users/export")
    public ResponseEntity<byte[]> exportUsers(
            @RequestParam(required = false) String userType,
            @RequestParam(required = false) String search) {
        
        try {
            List<Map<String, Object>> users = new ArrayList<>();
            
            // Get users based on type
            if (userType == null || userType.equals("FARMER")) {
                List<Farmer> farmers = farmerRepository.findAll();
                users.addAll(farmers.stream()
                    .map(this::convertFarmerToDetailedMap)
                    .collect(Collectors.toList()));
            }
            
            if (userType == null || userType.equals("BUYER")) {
                List<Buyer> buyers = buyerRepository.findAll();
                users.addAll(buyers.stream()
                    .map(this::convertBuyerToDetailedMap)
                    .collect(Collectors.toList()));
            }
            
            if (userType == null || userType.equals("DRIVER")) {
                List<Driver> drivers = driverRepository.findAll();
                users.addAll(drivers.stream()
                    .map(this::convertDriverToDetailedMap)
                    .collect(Collectors.toList()));
            }
            
            if (userType == null || userType.equals("ADMIN")) {
                List<Admin> admins = adminRepository.findAll();
                users.addAll(admins.stream()
                    .map(this::convertAdminToDetailedMap)
                    .collect(Collectors.toList()));
            }
            
            // Apply search filter if provided
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                users = users.stream()
                    .filter(user -> {
                        String email = (String) user.get("email");
                        String username = (String) user.get("username");
                        String role = (String) user.get("role");
                        
                        return (email != null && email.toLowerCase().contains(searchLower)) ||
                               (username != null && username.toLowerCase().contains(searchLower)) ||
                               (role != null && role.toLowerCase().contains(searchLower));
                    })
                    .collect(Collectors.toList());
            }
            
            // Generate CSV
            byte[] csvData = generateCSV(users);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                "ceyharvest_users_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
                
        } catch (Exception e) {
            return ResponseEntity.status(500).body(("Error exporting users: " + e.getMessage()).getBytes());
        }
    }

    /**
     * Register a new warehouse (admin only)
     */
    @PostMapping("/warehouses/register")
    public ResponseEntity<?> registerWarehouse(@RequestBody WarehouseRegisterDTO dto) {
        try {
            // Check for duplicate phone number
            if (warehouseRepository.findByPhoneNumber(dto.getPhoneNumber()).isPresent()) {
                return ResponseEntity.badRequest().body("Warehouse with this phone number already exists.");
            }
            Warehouse warehouse = new Warehouse();
            warehouse.setManagerName(dto.getManagerName());
            warehouse.setDistrict(dto.getDistrict());
            warehouse.setAddress(dto.getAddress());
            warehouse.setPhoneNumber(dto.getPhoneNumber());
            warehouse.setPassword(passwordEncoder.encode(dto.getPassword()));
            warehouse.setCreatedAt(java.time.LocalDateTime.now());
            warehouseRepository.save(warehouse);
            return ResponseEntity.ok("Warehouse registered successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error registering warehouse: " + e.getMessage());
        }
    }

    // List all warehouses
    @GetMapping("/warehouses")
    public ResponseEntity<?> getAllWarehouses() {
        return ResponseEntity.ok(warehouseRepository.findAll());
    }

    // Helper methods to convert entities to detailed maps
    private Map<String, Object> convertFarmerToDetailedMap(Farmer farmer) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", farmer.getId());
        map.put("username", farmer.getUsername());
        map.put("email", farmer.getEmail());
        map.put("firstName", farmer.getFirstName());
        map.put("lastName", farmer.getLastName());
        map.put("fullName", (farmer.getFirstName() != null ? farmer.getFirstName() : "") + 
                          " " + (farmer.getLastName() != null ? farmer.getLastName() : ""));
        map.put("phoneNumber", farmer.getPhoneNumber());
        map.put("address", farmer.getAddress());
        map.put("city", farmer.getCity());
        map.put("postalCode", farmer.getPostalCode());
        map.put("role", farmer.getRole());
        map.put("emailVerified", farmer.isEmailVerified());
        map.put("createdAt", farmer.getCreatedAt());
        map.put("updatedAt", farmer.getUpdatedAt());
        map.put("userType", "FARMER");
        return map;
    }
    
    private Map<String, Object> convertBuyerToDetailedMap(Buyer buyer) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", buyer.getId());
        map.put("username", buyer.getUsername());
        map.put("email", buyer.getEmail());
        map.put("firstName", buyer.getFirstName());
        map.put("lastName", buyer.getLastName());
        map.put("fullName", (buyer.getFirstName() != null ? buyer.getFirstName() : "") + 
                          " " + (buyer.getLastName() != null ? buyer.getLastName() : ""));
        map.put("phoneNumber", buyer.getPhoneNumber());
        map.put("address", buyer.getAddress());
        map.put("city", buyer.getCity());
        map.put("postalCode", buyer.getPostalCode());
        map.put("country", buyer.getCountry());
        map.put("role", buyer.getRole());
        map.put("emailVerified", buyer.isEmailVerified());
        map.put("createdAt", buyer.getCreatedAt());
        map.put("updatedAt", buyer.getUpdatedAt());
        map.put("userType", "BUYER");
        return map;
    }
    
    private Map<String, Object> convertDriverToDetailedMap(Driver driver) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", driver.getId());
        map.put("username", driver.getUsername());
        map.put("email", driver.getEmail());
        map.put("firstName", driver.getFirstName());
        map.put("lastName", driver.getLastName());
        map.put("fullName", (driver.getFirstName() != null ? driver.getFirstName() : "") + 
                          " " + (driver.getLastName() != null ? driver.getLastName() : ""));
        map.put("phoneNumber", driver.getPhoneNumber());
        map.put("address", driver.getAddress());
        map.put("city", driver.getCity());
        map.put("postalCode", driver.getPostalCode());
        map.put("role", driver.getRole());
        map.put("emailVerified", driver.isEmailVerified());
        map.put("createdAt", driver.getCreatedAt());
        map.put("updatedAt", driver.getUpdatedAt());
        map.put("userType", "DRIVER");
        return map;
    }
    
    private Map<String, Object> convertAdminToDetailedMap(Admin admin) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", admin.getId());
        map.put("username", admin.getUsername());
        map.put("email", admin.getEmail());
        map.put("firstName", null); // Admins don't have first/last names
        map.put("lastName", null);
        map.put("fullName", admin.getUsername());
        map.put("phoneNumber", null); // Admins don't have phone numbers
        map.put("address", null);
        map.put("city", null);
        map.put("postalCode", null);
        map.put("country", null);
        map.put("role", admin.getRole());
        map.put("emailVerified", admin.isEmailVerified());
        map.put("passwordChangedFromDefault", admin.isPasswordChangedFromDefault());
        map.put("createdAt", admin.getCreatedAt());
        map.put("updatedAt", admin.getUpdatedAt());
        map.put("userType", "ADMIN");
        return map;
    }
    
    private byte[] generateCSV(List<Map<String, Object>> users) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        OutputStreamWriter writer = new OutputStreamWriter(baos);
        
        // CSV Header
        writer.write("ID,Username,Email,First Name,Last Name,Phone Number,Address,City,Postal Code,Country,Role,Email Verified,Created At,Updated At\n");
        
        // CSV Data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (Map<String, Object> user : users) {
            writer.write(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                nvl(user.get("id")),
                nvl(user.get("username")),
                nvl(user.get("email")),
                nvl(user.get("firstName")),
                nvl(user.get("lastName")),
                nvl(user.get("phoneNumber")),
                nvl(user.get("address")),
                nvl(user.get("city")),
                nvl(user.get("postalCode")),
                nvl(user.get("country")),
                nvl(user.get("role")),
                user.get("emailVerified"),
                user.get("createdAt") != null ? ((LocalDateTime) user.get("createdAt")).format(formatter) : "",
                user.get("updatedAt") != null ? ((LocalDateTime) user.get("updatedAt")).format(formatter) : ""
            ));
        }
        
        writer.flush();
        writer.close();
        
        return baos.toByteArray();
    }
    
    private String nvl(Object value) {
        return value != null ? value.toString().replace("\"", "\"\"") : "";
    }

    /**
     * Delete a user by ID
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            // Check if user exists in any repository and delete
            boolean deleted = false;
            
            // Try to find and delete from farmer repository
            if (farmerRepository.existsById(id)) {
                farmerRepository.deleteById(id);
                deleted = true;
            }
            // Try to find and delete from buyer repository
            else if (buyerRepository.existsById(id)) {
                buyerRepository.deleteById(id);
                deleted = true;
            }
            // Try to find and delete from driver repository
            else if (driverRepository.existsById(id)) {
                driverRepository.deleteById(id);
                deleted = true;
            }
            // Try to find and delete from admin repository
            else if (adminRepository.existsById(id)) {
                adminRepository.deleteById(id);
                deleted = true;
            }
            
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "User deleted successfully");
                response.put("deletedUserId", id);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }

    /**
     * Update a user by ID
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> updateData) {
        try {
            // Find user in appropriate repository and update
            Optional<Farmer> farmer = farmerRepository.findById(id);
            if (farmer.isPresent()) {
                Farmer updatedFarmer = updateFarmerFromMap(farmer.get(), updateData);
                farmerRepository.save(updatedFarmer);
                return ResponseEntity.ok(convertFarmerToDetailedMap(updatedFarmer));
            }
            
            Optional<Buyer> buyer = buyerRepository.findById(id);
            if (buyer.isPresent()) {
                Buyer updatedBuyer = updateBuyerFromMap(buyer.get(), updateData);
                buyerRepository.save(updatedBuyer);
                return ResponseEntity.ok(convertBuyerToDetailedMap(updatedBuyer));
            }
            
            Optional<Driver> driver = driverRepository.findById(id);
            if (driver.isPresent()) {
                Driver updatedDriver = updateDriverFromMap(driver.get(), updateData);
                driverRepository.save(updatedDriver);
                return ResponseEntity.ok(convertDriverToDetailedMap(updatedDriver));
            }
            
            Optional<Admin> admin = adminRepository.findById(id);
            if (admin.isPresent()) {
                Admin updatedAdmin = updateAdminFromMap(admin.get(), updateData);
                adminRepository.save(updatedAdmin);
                return ResponseEntity.ok(convertAdminToDetailedMap(updatedAdmin));
            }
            
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating user: " + e.getMessage());
        }
    }

    private Farmer updateFarmerFromMap(Farmer farmer, Map<String, Object> updateData) {
        if (updateData.containsKey("firstName")) {
            farmer.setFirstName((String) updateData.get("firstName"));
        }
        if (updateData.containsKey("lastName")) {
            farmer.setLastName((String) updateData.get("lastName"));
        }
        if (updateData.containsKey("email")) {
            farmer.setEmail((String) updateData.get("email"));
        }
        if (updateData.containsKey("phoneNumber")) {
            farmer.setPhoneNumber((String) updateData.get("phoneNumber"));
        }
        if (updateData.containsKey("address")) {
            farmer.setAddress((String) updateData.get("address"));
        }
        if (updateData.containsKey("city")) {
            farmer.setCity((String) updateData.get("city"));
        }
        if (updateData.containsKey("postalCode")) {
            farmer.setPostalCode((String) updateData.get("postalCode"));
        }
        if (updateData.containsKey("role")) {
            farmer.setRole((String) updateData.get("role"));
        }
        if (updateData.containsKey("emailVerified")) {
            farmer.setEmailVerified((Boolean) updateData.get("emailVerified"));
        }
        farmer.setUpdatedAt(LocalDateTime.now());
        return farmer;
    }

    private Buyer updateBuyerFromMap(Buyer buyer, Map<String, Object> updateData) {
        if (updateData.containsKey("firstName")) {
            buyer.setFirstName((String) updateData.get("firstName"));
        }
        if (updateData.containsKey("lastName")) {
            buyer.setLastName((String) updateData.get("lastName"));
        }
        if (updateData.containsKey("email")) {
            buyer.setEmail((String) updateData.get("email"));
        }
        if (updateData.containsKey("phoneNumber")) {
            buyer.setPhoneNumber((String) updateData.get("phoneNumber"));
        }
        if (updateData.containsKey("address")) {
            buyer.setAddress((String) updateData.get("address"));
        }
        if (updateData.containsKey("city")) {
            buyer.setCity((String) updateData.get("city"));
        }
        if (updateData.containsKey("postalCode")) {
            buyer.setPostalCode((String) updateData.get("postalCode"));
        }
        if (updateData.containsKey("country")) {
            buyer.setCountry((String) updateData.get("country"));
        }
        if (updateData.containsKey("role")) {
            buyer.setRole((String) updateData.get("role"));
        }
        if (updateData.containsKey("emailVerified")) {
            buyer.setEmailVerified((Boolean) updateData.get("emailVerified"));
        }
        buyer.setUpdatedAt(LocalDateTime.now());
        return buyer;
    }

    private Driver updateDriverFromMap(Driver driver, Map<String, Object> updateData) {
        if (updateData.containsKey("firstName")) {
            driver.setFirstName((String) updateData.get("firstName"));
        }
        if (updateData.containsKey("lastName")) {
            driver.setLastName((String) updateData.get("lastName"));
        }
        if (updateData.containsKey("email")) {
            driver.setEmail((String) updateData.get("email"));
        }
        if (updateData.containsKey("phoneNumber")) {
            driver.setPhoneNumber((String) updateData.get("phoneNumber"));
        }
        if (updateData.containsKey("address")) {
            driver.setAddress((String) updateData.get("address"));
        }
        if (updateData.containsKey("city")) {
            driver.setCity((String) updateData.get("city"));
        }
        if (updateData.containsKey("postalCode")) {
            driver.setPostalCode((String) updateData.get("postalCode"));
        }
        if (updateData.containsKey("role")) {
            driver.setRole((String) updateData.get("role"));
        }
        if (updateData.containsKey("emailVerified")) {
            driver.setEmailVerified((Boolean) updateData.get("emailVerified"));
        }
        driver.setUpdatedAt(LocalDateTime.now());
        return driver;
    }

    private Admin updateAdminFromMap(Admin admin, Map<String, Object> updateData) {
        if (updateData.containsKey("email")) {
            admin.setEmail((String) updateData.get("email"));
        }
        if (updateData.containsKey("role")) {
            admin.setRole((String) updateData.get("role"));
        }
        if (updateData.containsKey("emailVerified")) {
            admin.setEmailVerified((Boolean) updateData.get("emailVerified"));
        }
        admin.setUpdatedAt(LocalDateTime.now());
        return admin;
    }
}
