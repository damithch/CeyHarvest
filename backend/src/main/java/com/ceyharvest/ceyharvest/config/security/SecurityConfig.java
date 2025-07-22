package com.ceyharvest.ceyharvest.config.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public authentication endpoints
                .requestMatchers(HttpMethod.POST, "/api/*/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/farmer/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/buyer/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/driver/register").permitAll()
                
                // Unified auth endpoints (public)
                .requestMatchers("/api/auth/**").permitAll()
                
                // Password reset endpoints (public)
                .requestMatchers("/api/auth/forgot-password").permitAll()
                .requestMatchers("/api/auth/reset-password").permitAll()
                .requestMatchers("/api/auth/verify-reset-token/**").permitAll()
                
                // Verification endpoints (public) - for email/SMS verification during registration
                .requestMatchers("/api/verification/**").permitAll()
                
                // Temporary password reset endpoint (REMOVE IN PRODUCTION)
                .requestMatchers("/api/admin/reset/**").permitAll()
                
                // Admin endpoints - only for ADMIN role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Farmer endpoints - only for FARMER role
                .requestMatchers("/api/farmer/**").hasRole("FARMER")
                
                // Buyer endpoints - only for BUYER role
                .requestMatchers("/api/buyer/**").hasRole("BUYER")
                
                // Driver endpoints - only for DRIVER role
                .requestMatchers("/api/driver/**").hasRole("DRIVER")
                
                // Health check and actuator endpoints
                .requestMatchers("/actuator/health").permitAll()
                // Marketplace public endpoints
                .requestMatchers("/api/marketplace/**").permitAll()
                // All other requests need authentication
                .anyRequest().authenticated()
            );

        // Add filters in correct order
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*", 
            "http://127.0.0.1:*",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
