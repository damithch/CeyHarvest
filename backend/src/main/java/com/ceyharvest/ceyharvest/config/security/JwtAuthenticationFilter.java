package com.ceyharvest.ceyharvest.config.security;

import com.ceyharvest.ceyharvest.util.JwtTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        System.out.println("[DEBUG] JwtAuthenticationFilter: Path = " + request.getServletPath());
        System.out.println("[DEBUG] JwtAuthenticationFilter: Authorization header = " + request.getHeader("Authorization"));
        
        final String requestTokenHeader = request.getHeader("Authorization");
        
        String email = null;
        String jwtToken = null;
        String role = null;
        String userId = null;
        List<String> authorities = null;

        // JWT Token is in the form "Bearer token". Remove Bearer word and get only the Token
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                email = jwtTokenUtil.extractEmail(jwtToken);
                role = jwtTokenUtil.extractRole(jwtToken);
                userId = jwtTokenUtil.extractUserId(jwtToken);
                // Extract authorities claim as a List<String>
                Object authClaim = jwtTokenUtil.extractClaim(jwtToken, claims -> claims.get("authorities"));
                if (authClaim instanceof List<?>) {
                    authorities = ((List<?>) authClaim).stream()
                        .filter(String.class::isInstance)
                        .map(String.class::cast)
                        .collect(Collectors.toList());
                }
                System.out.println("[DEBUG] JwtAuthenticationFilter: Token parsed successfully");
                System.out.println("[DEBUG] JwtAuthenticationFilter: email = " + email);
                System.out.println("[DEBUG] JwtAuthenticationFilter: Existing authentication = " + SecurityContextHolder.getContext().getAuthentication());
            } catch (Exception e) {
                System.out.println("[DEBUG] JwtAuthenticationFilter: Exception during token parsing: " + e.getMessage());
                logger.warn("JWT Token has expired or is invalid");
            }
        }

        // Validate token and set authentication (allow if email is null, e.g., warehouse login)
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            boolean valid = jwtTokenUtil.isValidToken(jwtToken);
            System.out.println("[DEBUG] JwtAuthenticationFilter: isValidToken = " + valid);
            if (valid) {
                String principal = (email != null) ? email : userId; // fallback to userId if email is null
                List<SimpleGrantedAuthority> grantedAuthorities = authorities != null
                    ? authorities.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList())
                    : Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        principal, null, grantedAuthorities);
                // Add user details to authentication
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // Set user ID in request attributes for controller access
                request.setAttribute("userId", userId);
                request.setAttribute("userRole", role);
                request.setAttribute("userEmail", email);
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        // Skip JWT validation for authentication endpoints
        return path.startsWith("/api/admin/login") || 
               path.startsWith("/api/farmer/login") || 
               path.startsWith("/api/buyer/login") ||
               path.startsWith("/api/farmer/register") ||
               path.startsWith("/api/buyer/register") ||
               path.startsWith("/api/driver/register") ||
               path.startsWith("/api/driver/login") ||
               path.startsWith("/api/auth/") || // Password reset endpoints
               path.startsWith("/api/admin/reset") || // Temporary for password reset
               path.startsWith("/api/yield/"); // ML/AI endpoints - public for testing
    }
}
