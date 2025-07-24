# PowerShell script to test Spring Boot endpoints

Write-Host "Testing Spring Boot Application Endpoints" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Test if application is running
Write-Host "`nChecking if application is running on port 8080..." -ForegroundColor Yellow
$portTest = netstat -ano | findstr :8080
if ($portTest) {
    Write-Host "✓ Application is running on port 8080" -ForegroundColor Green
} else {
    Write-Host "✗ Application is not running on port 8080" -ForegroundColor Red
    Write-Host "Please start the Spring Boot application first with: mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Test 1: Simple test endpoint
Write-Host "`n1. Testing simple endpoint: /api/buyer/checkout/test" -ForegroundColor Yellow
try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/checkout/test" -Method GET -ErrorAction Stop
    Write-Host "✓ Test endpoint successful" -ForegroundColor Green
    Write-Host "Response: $($response1 | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Test endpoint failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Payment intent test endpoint (no auth required)
Write-Host "`n2. Testing payment intent test endpoint: /api/buyer/checkout/test-payment-intent" -ForegroundColor Yellow
try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/checkout/test-payment-intent" -Method GET -ErrorAction Stop
    Write-Host "✓ Payment intent test endpoint successful" -ForegroundColor Green
    Write-Host "Response: $($response2 | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Payment intent test endpoint failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Authentication required endpoint (should fail without JWT)
Write-Host "`n3. Testing authenticated endpoint (should fail): /api/buyer/checkout/create-payment-intent" -ForegroundColor Yellow
try {
    $body = @{
        orderId = "test-order-123"
        paymentMethod = "card"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response3 = Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/checkout/create-payment-intent" -Method POST -Body $body -Headers $headers -ErrorAction Stop
    Write-Host "✓ Authenticated endpoint successful (unexpected)" -ForegroundColor Yellow
    Write-Host "Response: $($response3 | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Authenticated endpoint correctly returned 401 (Unauthorized)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✓ Authenticated endpoint correctly returned 403 (Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "✗ Authenticated endpoint failed with unexpected error" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTesting complete!" -ForegroundColor Green
