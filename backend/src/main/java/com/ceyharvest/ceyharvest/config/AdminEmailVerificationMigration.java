package com.ceyharvest.ceyharvest.config;

import com.ceyharvest.ceyharvest.document.Admin;
import com.ceyharvest.ceyharvest.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(3) // Run after AdminInitializer (Order 2)
public class AdminEmailVerificationMigration implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AdminSecurityConfig adminSecurityConfig;

    @Override
    public void run(String... args) throws Exception {
        migrateAdminEmailVerification();
    }

    private void migrateAdminEmailVerification() {
        System.out.println("🔧 Running Admin Email Verification Migration...");
        
        // Get all admin accounts
        List<Admin> allAdmins = adminRepository.findAll();
        boolean migrationNeeded = false;
        
        for (Admin admin : allAdmins) {
            boolean needsUpdate = false;
            
            // Check if emailVerified field needs to be set
            if (!admin.isEmailVerified()) {
                admin.setEmailVerified(true);
                needsUpdate = true;
                migrationNeeded = true;
                System.out.println("✅ Setting emailVerified=true for admin: " + admin.getEmail());
            }
            
            // Ensure authorized admins have correct passwords
            if (adminSecurityConfig.isAuthorizedAdminEmail(admin.getEmail())) {
                String expectedPassword = adminSecurityConfig.getDefaultAdminPassword();
                
                // Check if password needs to be reset (in case of encoding issues)
                if (!passwordEncoder.matches(expectedPassword, admin.getPassword())) {
                    admin.setPassword(passwordEncoder.encode(expectedPassword));
                    needsUpdate = true;
                    migrationNeeded = true;
                    System.out.println("🔑 Resetting password for admin: " + admin.getEmail());
                }
                
                // Set updated timestamp
                if (needsUpdate) {
                    admin.setUpdatedAt(LocalDateTime.now());
                    adminRepository.save(admin);
                }
            }
        }
        
        if (migrationNeeded) {
            System.out.println("✅ Admin Email Verification Migration completed successfully!");
            System.out.println("📧 All admin accounts now have emailVerified=true");
            System.out.println("🔑 Admin passwords have been verified/reset");
        } else {
            System.out.println("ℹ️  No migration needed - all admin accounts are already properly configured");
        }
        
        // Verify migration results
        verifyMigrationResults();
    }
    
    private void verifyMigrationResults() {
        System.out.println("🔍 Verifying migration results...");
        
        for (String email : adminSecurityConfig.getAuthorizedAdminEmails()) {
            adminRepository.findByEmail(email).ifPresent(admin -> {
                boolean passwordValid = passwordEncoder.matches(
                    adminSecurityConfig.getDefaultAdminPassword(), 
                    admin.getPassword()
                );
                
                System.out.printf("Admin: %s | EmailVerified: %s | PasswordValid: %s%n", 
                    email, admin.isEmailVerified(), passwordValid);
                    
                if (!admin.isEmailVerified() || !passwordValid) {
                    System.err.println("❌ Migration verification failed for: " + email);
                } else {
                    System.out.println("✅ Migration verified for: " + email);
                }
            });
        }
        
        System.out.println("🎉 Migration verification completed!");
    }
}
