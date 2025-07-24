# Phase 6: Production Deployment - Environment Configuration and Hardening

## 🎯 Overview
Configure the application for production deployment with security hardening, environment management, and scalability considerations.

## 📋 Implementation Plan

### 1. **Environment Configuration**

#### **A. Production Application Properties**
```properties
# application-prod.properties
server.port=8080
server.servlet.context-path=/

# MongoDB Production Configuration
spring.data.mongodb.uri=${MONGODB_URI}
spring.data.mongodb.database=${MONGODB_DATABASE:ceyharvest_prod}

# Security Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Stripe Production Configuration
stripe.secret.key=${STRIPE_SECRET_KEY}
stripe.publishable.key=${STRIPE_PUBLISHABLE_KEY}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}

# SSL Configuration
server.ssl.enabled=true
server.ssl.key-store=${SSL_KEYSTORE_PATH}
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12

# Logging Configuration
logging.level.com.ceyharvest=INFO
logging.level.org.springframework.security=WARN
logging.file.name=/var/log/ceyharvest/application.log
logging.pattern.file=%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n

# Rate Limiting
app.rate-limit.requests-per-minute=${RATE_LIMIT_RPM:60}
app.rate-limit.burst-capacity=${RATE_LIMIT_BURST:10}

# CORS Configuration
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:https://ceyharvest.com,https://www.ceyharvest.com}

# Cache Configuration
spring.cache.type=redis
spring.redis.host=${REDIS_HOST:localhost}
spring.redis.port=${REDIS_PORT:6379}
spring.redis.password=${REDIS_PASSWORD}

# Email Configuration
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Health Check Configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
management.health.db.enabled=true
```

#### **B. Docker Configuration**
```dockerfile
# Dockerfile
FROM openjdk:21-jre-slim

# Create application user
RUN addgroup --system ceyharvest && adduser --system --group ceyharvest

# Set working directory
WORKDIR /app

# Copy application jar
COPY target/ceyharvest-*.jar app.jar

# Change ownership
RUN chown -R ceyharvest:ceyharvest /app

# Switch to application user
USER ceyharvest

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# JVM Configuration
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseStringDeduplication"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  ceyharvest-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - REDIS_HOST=redis
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - ceyharvest-network
    volumes:
      - ./logs:/var/log/ceyharvest

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - ceyharvest-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - ceyharvest-app
    restart: unless-stopped
    networks:
      - ceyharvest-network

volumes:
  redis_data:

networks:
  ceyharvest-network:
    driver: bridge
```

#### **C. Nginx Configuration**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream ceyharvest_backend {
        server ceyharvest-app:8080;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    server {
        listen 80;
        server_name ceyharvest.com www.ceyharvest.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name ceyharvest.com www.ceyharvest.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' api.stripe.com;";

        # Rate limiting
        location /api/auth/ {
            limit_req zone=auth burst=10 nodelay;
            proxy_pass http://ceyharvest_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://ceyharvest_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files (Frontend)
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 2. **Security Hardening**

#### **A. Enhanced Security Configuration**
```java
// config/security/ProductionSecurityConfig.java
@Configuration
@Profile("prod")
@EnableWebSecurity
public class ProductionSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                .contentTypeOptions(HeadersConfigurer.ContentTypeOptionsConfig::and)
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true)
                    .preload(true)
                )
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/webhook/stripe").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers("/api/buyer/**").hasRole("BUYER")
                .requestMatchers("/api/farmer/**").hasRole("FARMER")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "https://ceyharvest.com",
            "https://www.ceyharvest.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

#### **B. Input Validation and Sanitization**
```java
// config/ValidationConfig.java
@Configuration
public class ValidationConfig {

    @Bean
    public Validator validator() {
        return Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Component
    public static class InputSanitizer {
        
        public String sanitizeInput(String input) {
            if (input == null) return null;
            
            // Remove potential XSS threats
            return input.replaceAll("<script[^>]*>.*?</script>", "")
                       .replaceAll("javascript:", "")
                       .replaceAll("on\\w+\\s*=", "");
        }
        
        public String sanitizeEmail(String email) {
            if (email == null) return null;
            return email.toLowerCase().trim();
        }
    }
}
```

### 3. **Monitoring and Logging**

#### **A. Application Monitoring**
```java
// config/MonitoringConfig.java
@Configuration
@EnableConfigurationProperties
public class MonitoringConfig {

    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config()
            .commonTags("application", "ceyharvest")
            .commonTags("environment", "production");
    }

    @EventListener
    public void handlePaymentEvent(PaymentEvent event) {
        Metrics.counter("payment.processed", 
            "status", event.getStatus(),
            "gateway", event.getGateway())
            .increment();
    }

    @EventListener
    public void handleOrderEvent(OrderEvent event) {
        Metrics.counter("order.created",
            "status", event.getStatus())
            .increment();
    }
}
```

#### **B. Structured Logging**
```java
// config/LoggingConfig.java
@Configuration
public class LoggingConfig {

    @Bean
    public Logger structuredLogger() {
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        
        // JSON encoder for structured logging
        JsonEncoder jsonEncoder = new JsonEncoder();
        jsonEncoder.setContext(context);
        jsonEncoder.start();
        
        return context.getLogger("APPLICATION");
    }
}

// service/AuditService.java
@Service
public class AuditService {
    
    private static final Logger auditLogger = LoggerFactory.getLogger("AUDIT");
    
    public void logPaymentEvent(String orderId, String status, String amount) {
        auditLogger.info("Payment event: orderId={}, status={}, amount={}", 
            orderId, status, amount);
    }
    
    public void logSecurityEvent(String event, String userEmail, String ipAddress) {
        auditLogger.warn("Security event: event={}, user={}, ip={}", 
            event, userEmail, ipAddress);
    }
}
```

### 4. **Deployment Scripts**

#### **A. CI/CD Pipeline (GitHub Actions)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Run tests
        run: ./mvnw test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
          
      - name: Build application
        run: ./mvnw clean package -DskipTests
        
      - name: Build Docker image
        run: |
          docker build -t ceyharvest:${{ github.sha }} .
          docker tag ceyharvest:${{ github.sha }} ceyharvest:latest
          
      - name: Deploy to production
        run: |
          echo "${{ secrets.DEPLOY_KEY }}" | base64 -d > deploy_key
          chmod 600 deploy_key
          scp -i deploy_key -o StrictHostKeyChecking=no docker-compose.prod.yml ${{ secrets.HOST }}:/opt/ceyharvest/
          ssh -i deploy_key -o StrictHostKeyChecking=no ${{ secrets.HOST }} "cd /opt/ceyharvest && docker-compose -f docker-compose.prod.yml up -d"
```

#### **B. Database Migration Script**
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "Starting CeyHarvest deployment..."

# Environment setup
export SPRING_PROFILES_ACTIVE=prod
export MONGODB_URI="$MONGODB_PROD_URI"
export JWT_SECRET="$JWT_PROD_SECRET"

# Backup current database
echo "Creating database backup..."
mongodump --uri="$MONGODB_URI" --out="/backup/$(date +%Y%m%d_%H%M%S)"

# Pull latest code
echo "Updating application..."
git pull origin main

# Build application
echo "Building application..."
./mvnw clean package -DskipTests

# Update Docker containers
echo "Updating containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Health check
echo "Performing health check..."
sleep 30
curl -f http://localhost:8080/actuator/health || {
    echo "Health check failed, rolling back..."
    docker-compose -f docker-compose.prod.yml down
    # Rollback logic here
    exit 1
}

echo "Deployment completed successfully!"
```

### 5. **Environment Variables Template**
```bash
# .env.production
# Application Configuration
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ceyharvest_prod
MONGODB_DATABASE=ceyharvest_prod

# Security Configuration
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRATION=86400000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# SSL Configuration
SSL_KEYSTORE_PATH=/etc/ssl/ceyharvest.p12
SSL_KEYSTORE_PASSWORD=your_keystore_password

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@ceyharvest.com
MAIL_PASSWORD=your_email_password

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://ceyharvest.com,https://www.ceyharvest.com

# Rate Limiting
RATE_LIMIT_RPM=60
RATE_LIMIT_BURST=10
```

## ✅ Production Deployment Checklist

### **Pre-Deployment**
- [ ] Set up production MongoDB cluster
- [ ] Configure Stripe live API keys
- [ ] Obtain SSL certificates
- [ ] Set up Redis cache
- [ ] Configure email service
- [ ] Set up monitoring (New Relic, DataDog, etc.)
- [ ] Configure log aggregation
- [ ] Set up backup strategy

### **Security**
- [ ] Enable HTTPS only
- [ ] Configure security headers
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up intrusion detection
- [ ] Implement security monitoring

### **Performance**
- [ ] Configure caching strategy
- [ ] Set up CDN for static assets
- [ ] Optimize database queries
- [ ] Configure connection pooling
- [ ] Set up load balancing
- [ ] Implement graceful shutdown

### **Monitoring**
- [ ] Set up health checks
- [ ] Configure application metrics
- [ ] Set up error tracking
- [ ] Configure log monitoring
- [ ] Set up alerting
- [ ] Create dashboards

### **Backup & Recovery**
- [ ] Set up automated database backups
- [ ] Test restore procedures
- [ ] Configure file storage backups
- [ ] Document recovery procedures
- [ ] Set up disaster recovery plan
