package com.ceyharvest.ceyharvest.config.security;

import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class AdminSecurityConfig {
    
    // Authorized admin emails - these are the ONLY emails allowed for admin access
    private static final Set<String> AUTHORIZED_ADMIN_EMAILS = Set.of(
        "jayaofficialj2@gmail.com",
        "kaveeshatech@gmail.com"
    );
    
    /**
     * Check if an email is authorized for admin access
     * @param email The email to check
     * @return true if authorized, false otherwise
     */
    public boolean isAuthorizedAdminEmail(String email) {
        return AUTHORIZED_ADMIN_EMAILS.contains(email);
    }
    
    /**
     * Get all authorized admin emails
     * @return Set of authorized admin emails
     */
    public Set<String> getAuthorizedAdminEmails() {
        return AUTHORIZED_ADMIN_EMAILS;
    }
    
    /**
     * Get default admin password for new installations
     * @return Default password
     */
    public String getDefaultAdminPassword() {
        return "CeyHarvest@Admin2024";
    }
}
