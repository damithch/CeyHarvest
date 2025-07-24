@echo off
echo Testing Spring Boot Application Endpoints
echo =========================================

echo.
echo Checking if application is running on port 8080...
netstat -ano | findstr :8080
if errorlevel 1 (
    echo Application is not running on port 8080
    echo Please start the Spring Boot application first with: mvn spring-boot:run
    pause
    exit /b 1
) else (
    echo Application is running on port 8080
)

echo.
echo 1. Testing simple endpoint: /api/buyer/checkout/test
curl -s -w "HTTP Status: %%{http_code}\n" "http://localhost:8080/api/buyer/checkout/test"

echo.
echo 2. Testing payment intent test endpoint: /api/buyer/checkout/test-payment-intent
curl -s -w "HTTP Status: %%{http_code}\n" "http://localhost:8080/api/buyer/checkout/test-payment-intent"

echo.
echo 3. Testing authenticated endpoint (should return 401/403): /api/buyer/checkout/create-payment-intent
curl -s -w "HTTP Status: %%{http_code}\n" -X POST ^
     -H "Content-Type: application/json" ^
     -d "{\"orderId\":\"test-order-123\",\"paymentMethod\":\"card\"}" ^
     "http://localhost:8080/api/buyer/checkout/create-payment-intent"

echo.
echo Testing complete!
pause
