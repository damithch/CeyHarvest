package com.ceyharvest.ceyharvest.config;

import com.ceyharvest.ceyharvest.document.Admin;
import com.ceyharvest.ceyharvest.repository.AdminRepository;
import com.ceyharvest.ceyharvest.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2) // Run after PasswordMigration
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AdminSecurityConfig adminSecurityConfig;
    
    @Autowired
    private EmailService emailService;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultAdmin();
    }

    private void initializeDefaultAdmin() {
        // Remove any existing admin accounts that are not authorized
        adminRepository.findAll().forEach(admin -> {
            if (!adminSecurityConfig.isAuthorizedAdminEmail(admin.getEmail())) {
                adminRepository.delete(admin);
                System.out.println("Removed unauthorized admin account: " + admin.getEmail());
            }
        });
        
        // Create authorized admin accounts if they don't exist
        for (String email : adminSecurityConfig.getAuthorizedAdminEmails()) {
            if (adminRepository.findByEmail(email).isEmpty()) {
                Admin admin = new Admin();
                admin.setUsername(email.split("@")[0] + "_admin"); // Use email prefix as username
                admin.setEmail(email);
                admin.setPassword(passwordEncoder.encode(adminSecurityConfig.getDefaultAdminPassword()));
                admin.setRole("ADMIN");
                adminRepository.save(admin);
                System.out.println("Created admin account: " + email);
                
                // Send welcome email to new admin
                try {
                    emailService.sendAdminWelcomeEmail(email, admin.getUsername(), adminSecurityConfig.getDefaultAdminPassword());
                } catch (Exception e) {
                    System.err.println("Failed to send welcome email to " + email + ": " + e.getMessage());
                }
            }
        }
        
        // Display authorized admin accounts info
        long adminCount = adminRepository.count();
        if (adminCount > 0) {
            System.out.println("=== AUTHORIZED CEYHARVEST ADMIN ACCOUNTS ===");
            adminSecurityConfig.getAuthorizedAdminEmails().forEach(email -> 
                System.out.println("Admin - Email: " + email));
            System.out.println("Default Password: " + adminSecurityConfig.getDefaultAdminPassword());
            System.out.println("PLEASE CHANGE PASSWORDS IN PRODUCTION!");
            System.out.println("============================================");
        }
    }
}
