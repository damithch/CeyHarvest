package com.ceyharvest.ceyharvest.config;

import com.ceyharvest.ceyharvest.document.Admin;
import com.ceyharvest.ceyharvest.document.Farmer;
import com.ceyharvest.ceyharvest.document.Buyer;
import com.ceyharvest.ceyharvest.document.Driver;
import com.ceyharvest.ceyharvest.repository.AdminRepository;
import com.ceyharvest.ceyharvest.repository.FarmerRepository;
import com.ceyharvest.ceyharvest.repository.BuyerRepository;
import com.ceyharvest.ceyharvest.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1) // Run before AdminInitializer
public class PasswordMigration implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private FarmerRepository farmerRepository;
    
    @Autowired
    private BuyerRepository buyerRepository;
    
    @Autowired
    private DriverRepository driverRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔄 Checking for password migration...");
        
        migrateAdminPasswords();
        migrateFarmerPasswords();
        migrateBuyerPasswords();
        migrateDriverPasswords();
        
        System.out.println("✅ Password migration completed");
    }

    private void migrateAdminPasswords() {
        List<Admin> admins = adminRepository.findAll();
        for (Admin admin : admins) {
            if (!isPasswordEncrypted(admin.getPassword())) {
                String encryptedPassword = passwordEncoder.encode(admin.getPassword());
                admin.setPassword(encryptedPassword);
                adminRepository.save(admin);
                System.out.println("🔐 Migrated admin password for: " + admin.getEmail());
            }
        }
    }

    private void migrateFarmerPasswords() {
        List<Farmer> farmers = farmerRepository.findAll();
        for (Farmer farmer : farmers) {
            if (!isPasswordEncrypted(farmer.getPassword())) {
                String encryptedPassword = passwordEncoder.encode(farmer.getPassword());
                farmer.setPassword(encryptedPassword);
                farmerRepository.save(farmer);
                System.out.println("🔐 Migrated farmer password for: " + farmer.getEmail());
            }
        }
    }

    private void migrateBuyerPasswords() {
        List<Buyer> buyers = buyerRepository.findAll();
        for (Buyer buyer : buyers) {
            if (!isPasswordEncrypted(buyer.getPassword())) {
                String encryptedPassword = passwordEncoder.encode(buyer.getPassword());
                buyer.setPassword(encryptedPassword);
                buyerRepository.save(buyer);
                System.out.println("🔐 Migrated buyer password for: " + buyer.getEmail());
            }
        }
    }

    private void migrateDriverPasswords() {
        List<Driver> drivers = driverRepository.findAll();
        for (Driver driver : drivers) {
            if (!isPasswordEncrypted(driver.getPassword())) {
                String encryptedPassword = passwordEncoder.encode(driver.getPassword());
                driver.setPassword(encryptedPassword);
                driverRepository.save(driver);
                System.out.println("🔐 Migrated driver password for: " + driver.getEmail());
            }
        }
    }

    // BCrypt hashes always start with $2a$, $2b$, $2x$, or $2y$
    private boolean isPasswordEncrypted(String password) {
        return password != null && password.startsWith("$2");
    }
}
